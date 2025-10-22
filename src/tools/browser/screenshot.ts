import fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import type { Page } from 'playwright';
import { BrowserToolBase } from './base.js';
import { ToolContext, ToolResponse, createSuccessResponse } from '../common/types.js';

const defaultDownloadsPath = path.join(os.homedir(), 'Downloads');

/**
 * Tool for taking screenshots of pages or elements
 */
export class ScreenshotTool extends BrowserToolBase {
  private screenshots = new Map<string, string>();

  /**
   * Execute the screenshot tool
   */
  async execute(args: any, context: ToolContext): Promise<ToolResponse> {
    return this.safeExecute(context, async (page) => {
      const screenshotOptions: any = {
        type: args.type || "png",
        fullPage: !!args.fullPage
      };

      if (args.selector) {
        const element = await page.$(args.selector);
        if (!element) {
          return {
            content: [{
              type: "text",
              text: `Element not found: ${args.selector}`,
            }],
            isError: true
          };
        }
        screenshotOptions.element = element;
      }

      // Take screenshot and get buffer
      const screenshotBuffer = await page.screenshot(screenshotOptions);
      const base64Screenshot = screenshotBuffer.toString('base64');

      // Generate output path for optional saving
      let fileSaveMessage = "";
      if (args.saveToFile !== false) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${args.name || 'screenshot'}-${timestamp}.png`;
        const downloadsDir = args.downloadsDir || defaultDownloadsPath;

        if (!fs.existsSync(downloadsDir)) {
          fs.mkdirSync(downloadsDir, { recursive: true });
        }

        const outputPath = path.join(downloadsDir, filename);
        await fs.promises.writeFile(outputPath, screenshotBuffer);
        fileSaveMessage = `Screenshot also saved to: ${path.relative(process.cwd(), outputPath)}`;
      }

      const messages = [`Screenshot captured successfully (${screenshotBuffer.length} bytes)`];

      // Handle base64 storage
      if (args.storeBase64 !== false) {
        this.screenshots.set(args.name || 'screenshot', base64Screenshot);
        this.server.notification({
          method: "notifications/resources/list_changed",
        });

        messages.push(`Screenshot stored in memory with name: '${args.name || 'screenshot'}'`);
      }

      if (fileSaveMessage) {
        messages.push(fileSaveMessage);
      }

      // Return the actual image data
      return {
        content: [
          {
            type: "text",
            text: messages.join('\n'),
          },
          {
            type: "image",
            data: base64Screenshot,
            mimeType: `image/${args.type || "png"}`,
            filename: `${args.name || 'screenshot'}.${args.type || "png"}`
          }
        ],
        isError: false
      };
    });
  }

  /**
   * Get all stored screenshots
   */
  getScreenshots(): Map<string, string> {
    return this.screenshots;
  }
} 
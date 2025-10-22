import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export function createToolDefinitions() {
  return [
    {
      name: "playwright_navigate",
      description: "Navigate to a URL",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string" },
          headless: { type: "boolean" },
          timeout: { type: "number" }
        },
        required: ["url"]
      }
    },
    {
      name: "playwright_screenshot",
      description: "Take a screenshot of the current page or a specific element",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          selector: { type: "string" },
          fullPage: { type: "boolean" },
          savePng: { type: "boolean" }
        },
        required: ["name"]
      }
    },
    {
      name: "playwright_click",
      description: "Click an element on the page",
      inputSchema: {
        type: "object",
        properties: {
          selector: { type: "string" },
        },
        required: ["selector"],
      },
    },
    {
      name: "playwright_fill",
      description: "fill out an input field",
      inputSchema: {
        type: "object",
        properties: {
          selector: { type: "string" },
          value: { type: "string" },
        },
        required: ["selector", "value"],
      },
    },
    {
      name: "playwright_select",
      description: "Select an element on the page with Select tag",
      inputSchema: {
        type: "object",
        properties: {
          selector: { type: "string" },
          value: { type: "string" },
        },
        required: ["selector", "value"],
      },
    },
    {
      name: "playwright_hover",
      description: "Hover an element on the page",
      inputSchema: {
        type: "object",
        properties: {
          selector: { type: "string" },
        },
        required: ["selector"],
      },
    },
    {
      name: "playwright_upload_file",
      description: "Upload a file to an input[type='file'] element on the page",
      inputSchema: {
        type: "object",
        properties: {
          selector: { type: "string" },
          filePath: { type: "string" }
        },
        required: ["selector", "filePath"],
      },
    },
    {
      name: "playwright_evaluate",
      description: "Execute JavaScript in the browser console",
      inputSchema: {
        type: "object",
        properties: {
          script: { type: "string" },
        },
        required: ["script"],
      },
    },
    {
      name: "playwright_console_logs",
      description: "Retrieve console logs from the browser with filtering options",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string" },
          search: { type: "string" },
          limit: { type: "number" },
          clear: { type: "boolean" }
        },
        required: [],
      }
    },
    {
      name: "playwright_close",
      description: "Close the browser and release all resources",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "playwright_http_request",
      description: "Perform an HTTP request with a specified method (GET, POST, PUT, PATCH, DELETE)",
      inputSchema: {
        type: "object",
        properties: {
          method: { type: "string" },
          url: { type: "string" },
          data: { type: "string" },
          headers: { type: "object" },
          token: { type: "string" }
        },
        required: ["method", "url"]
      }
    },
    {
      name: "playwright_custom_user_agent",
      description: "Set a custom User Agent for the browser",
      inputSchema: {
        type: "object",
        properties: {
          userAgent: { type: "string" }
        },
        required: ["userAgent"],
      },
    },
    {
      name: "playwright_get_visible_text",
      description: "Get the visible text content of the current page",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "playwright_get_visible_html",
      description: "Get the HTML content of the current page. By default, all <script> tags are removed from the output unless removeScripts is explicitly set to false.",
      inputSchema: {
        type: "object",
        properties: {
          selector: { type: "string" },
          removeScripts: { type: "boolean" },
          maxLength: { type: "number" }
        },
        required: []
      }
    },
    {
      name: "playwright_press_key",
      description: "Press a keyboard key",
      inputSchema: {
        type: "object",
        properties: {
          key: { type: "string" },
          selector: { type: "string" }
        },
        required: ["key"],
      },
    },
    {
      name: "playwright_click_and_switch_tab",
      description: "Click a link and switch to the newly opened tab",
      inputSchema: {
        type: "object",
        properties: {
          selector: { type: "string" },
        },
        required: ["selector"],
      },
    },
  ] as const satisfies Tool[];
}

// Browser-requiring tools for conditional browser launch
export const BROWSER_TOOLS = [
  "playwright_navigate",
  "playwright_screenshot",
  "playwright_click",
  "playwright_fill",
  "playwright_select",
  "playwright_hover",
  "playwright_upload_file",
  "playwright_evaluate",
  "playwright_close",
  "playwright_get_visible_text",
  "playwright_get_visible_html",
  "playwright_press_key",
  "playwright_click_and_switch_tab"
];

// API Request tools for conditional launch
export const API_TOOLS = [
  "playwright_http_request"
];

// All available tools
export const tools = [
  ...BROWSER_TOOLS,
  ...API_TOOLS,
];
import { ApiToolBase } from './base.js';
import { ToolContext, ToolResponse, createSuccessResponse, createErrorResponse } from '../common/types.js';


export class HttpRequestTool extends ApiToolBase {
  /**
   * Execute the HTTP request tool
   * @param args - expects { method: string, url: string, value?: any, headers?: object, token?: string }
   */
  async execute(args: any, context: ToolContext): Promise<ToolResponse> {
    return this.safeExecute(context, async (apiContext) => {
      const method = (args.method || 'GET').toUpperCase();

      // Prepare request options
      let data = args.value;
      // Try parsing JSON body if value is string starting with { or [
      if (data && typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
        try {
          data = JSON.parse(data);
        } catch (error) {
          return createErrorResponse(`Failed to parse request body: ${(error as Error).message}`);
        }
      }

      // Setup headers with authorization token if present
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
        ...(args.token ? { 'Authorization': `Bearer ${args.token}` } : {}),
        ...(args.headers || {})
      };

      // Select the method and call the appropriate apiContext function
      let response;
      switch (method) {
        case 'GET':
          response = await apiContext.get(args.url, { headers });
          break;
        case 'POST':
          response = await apiContext.post(args.url, { data, headers });
          break;
        case 'PUT':
          response = await apiContext.put(args.url, { data, headers });
          break;
        case 'PATCH':
          response = await apiContext.patch(args.url, { data, headers });
          break;
        case 'DELETE':
          response = await apiContext.delete(args.url, { headers });
          break;
        default:
          return createErrorResponse(`Unsupported HTTP method: ${method}`);
      }

      // Try to get response text safely
      let responseText;
      try {
        responseText = await response.text();
      } catch {
        responseText = 'Unable to get response text';
      }

      return createSuccessResponse([
        `${method} request to ${args.url}`,
        `Status: ${response.status()} ${response.statusText()}`,
        `Response: ${responseText.substring(0, 1000)}${responseText.length > 1000 ? '...' : ''}`
      ]);
    });
  }
}
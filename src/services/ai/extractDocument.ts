import type { ExtractionResult } from './types';
import { callClaude } from './claudeClient';
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionMessage } from './prompts';
import { pdfToImages, imageFileToDataUrl } from './pdfToImages';

export async function extractDocument(
  apiKey: string,
  file: File,
): Promise<ExtractionResult> {
  // Convert file to images
  let images: string[];
  if (file.type === 'application/pdf') {
    images = await pdfToImages(file);
  } else {
    images = await imageFileToDataUrl(file);
  }

  if (images.length === 0) {
    throw new Error('Could not extract any images from the file');
  }

  const content = buildExtractionMessage(images);

  const response = await callClaude(apiKey, EXTRACTION_SYSTEM_PROMPT, [
    { role: 'user', content },
  ]);

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock?.text) {
    throw new Error('No text response from Claude');
  }

  // Parse JSON, stripping any markdown fences if present
  let jsonStr = textBlock.text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const result: ExtractionResult = JSON.parse(jsonStr);

  // Validate required fields
  if (!result.documentType || result.confidence === undefined || !result.extractedData) {
    throw new Error('Invalid extraction response: missing required fields');
  }

  return result;
}

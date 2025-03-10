import { NextRequest, NextResponse } from 'next/server';
import { getBoxClient } from '../../utils/tokenManager';
import { AiTextGen } from 'box-typescript-sdk-gen/lib/schemas/aiTextGen.generated';
import { AiDialogueHistory } from 'box-typescript-sdk-gen/lib/schemas/aiDialogueHistory.generated';
import { dateTimeFromString } from 'box-typescript-sdk-gen/lib/internal/utils.js';
import { AiAgentBasicGenTool } from 'box-typescript-sdk-gen/lib/schemas/aiAgentBasicGenTool.generated';
import { AiAgentReferenceOrAiAgentTextGen } from 'box-typescript-sdk-gen/lib/schemas/aiAgentReferenceOrAiAgentTextGen.generated';


export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages is required and must be an array' },
        { status: 400 }
      );
    }
    
    // Default to Azure GPT-4o Mini if no model specified
    const selectedModel = model || 'azure__openai__gpt_4o_mini';
    
    console.log('Using AI model:', selectedModel);

    // Get Box client with token management
    const client = await getBoxClient();

    // Get the latest user message for the prompt
    const latestUserMessage = messages[messages.length - 1].content;

    // For the first message in a conversation (no previous exchanges)
    if (messages.length <= 1) {
      console.log('First message in conversation - no dialogue history');

      // Create a request payload without dialogue history
      const firstRequestPayload = {
        prompt: latestUserMessage,
        items: [
          {
            id: process.env.BOX_DUMMY_FILE_ID || '',
            type: "file"
          }
        ],
        aiAgent: {
          type: "ai_agent_text_gen",
          basicGen: {
            "model": selectedModel
          } satisfies AiAgentBasicGenTool
        } satisfies AiAgentReferenceOrAiAgentTextGen
      } satisfies AiTextGen;

      console.log('Sending first request to Box AI');
      const response = await client.ai.createAiTextGen(firstRequestPayload);

      console.log('Box AI response received');

      // Extract the answer from the response
      if (!response.answer) {
        throw new Error('No answer received from Box AI');
      }

      // Return the answer to the frontend
      return NextResponse.json({
        response: response.answer
      });
    }

    // For follow-up messages (with dialogue history)
    console.log('Building dialogue history for follow-up message');

    // Collect dialogue history entries
    const historyEntries = [];

    // Process all complete exchanges (user + assistant pairs) except the latest user message
    for (let i = 0; i < messages.length - 1; i += 2) {
      // Check if we have a complete exchange (user message followed by assistant response)
      if (i + 1 < messages.length &&
        messages[i].role === 'user' &&
        messages[i + 1].role === 'assistant') {

        // Convert timestamp to DateTime
        let timestamp;
        try {
          // Try to use the timestamp directly
          timestamp = dateTimeFromString(messages[i + 1].timestamp);
        } catch (e) {
          // If that fails, try to convert it to a string first
          const dateStr = typeof messages[i + 1].timestamp === 'object'
            ? new Date(messages[i + 1].timestamp).toISOString()
            : messages[i + 1].timestamp;
          timestamp = dateTimeFromString(dateStr);
        }

        // Add to history entries
        historyEntries.push({
          prompt: messages[i].content,
          answer: messages[i + 1].content,
          createdAt: timestamp
        });
      }
    }

    // Create a complete request payload with dialogue history
    const followUpRequestPayload = {
      prompt: latestUserMessage,
      items: [
        {
          id: process.env.BOX_DUMMY_FILE_ID || '',
          type: "file"
        }
      ],
      dialogueHistory: historyEntries,
      aiAgent: {
        type: "ai_agent_text_gen",
        basicGen: {
          "model": selectedModel
        } satisfies AiAgentBasicGenTool
      } satisfies AiAgentReferenceOrAiAgentTextGen
    } satisfies AiTextGen;

    console.log('Sending follow-up request to Box AI with', historyEntries.length, 'dialogue history entries');

    console.log(followUpRequestPayload);
    // Call Box AI with the complete follow-up request payload
    const response = await client.ai.createAiTextGen(followUpRequestPayload);

    console.log('Box AI response received');

    // Extract the answer from the response
    if (!response.answer) {
      throw new Error('No answer received from Box AI');
    }

    // Return the answer to the frontend
    return NextResponse.json({
      response: response.answer
    });
  } catch (error: any) {
    // Log the complete error object
    console.error('Error in chat API:', error);

    // Log detailed request and response info
    if (error.requestInfo) {
      console.error('Request Info:', JSON.stringify(error.requestInfo, null, 2));
    }

    if (error.responseInfo) {
      console.error('Response Info:', JSON.stringify(error.responseInfo, null, 2));
    }

    // Return detailed error information for debugging
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error.message || String(error),
        requestInfo: error.requestInfo || 'No request info available',
        responseInfo: error.responseInfo || 'No response info available',
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
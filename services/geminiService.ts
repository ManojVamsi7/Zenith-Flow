
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Subject, Task, StudySession } from '../types';

if (!process.env.API_KEY) {
  // In a real app, this would be a fatal error.
  // For this environment, we will mock the API key.
  // In a real build, process.env.API_KEY would be set.
  process.env.API_KEY = "mock-api-key-for-local-dev";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCK_RESPONSE = `Based on your recent activity, here are a few insights:

**Focus Area:** You've spent a significant amount of time on **Computer Science**, which is great! However, your study time for **History** is comparatively low.

**Recommendation:**
- **Allocate a dedicated Pomodoro session for History** in the next two days to catch up.
- You have an overdue task for Computer Science. It's best to **tackle that task first** before starting new topics.

Keep up the great work! Consistent effort is the key to success.
`;


export const getSmartInsights = async (
  subjects: Subject[],
  tasks: Task[],
  sessions: StudySession[]
): Promise<string> => {
  // In a real scenario with a configured API key, we would make a real API call.
  // For this example, we check for the mock key and return a mock response.
  if (process.env.API_KEY === 'mock-api-key-for-local-dev') {
      return new Promise(resolve => setTimeout(() => resolve(MOCK_RESPONSE), 1500));
  }

  const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

  const studySummary = subjects.map(subject => {
    const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
    const totalTime = subjectSessions.reduce((acc, s) => acc + s.duration, 0);
    return `${subject.name}: ${Math.floor(totalTime / 60)} minutes`;
  }).join(', ');

  const taskSummary = tasks.map(task => {
    const subjectName = subjectMap.get(task.subjectId) || 'Unknown Subject';
    const status = task.completed ? 'Completed' : 'Pending';
    const overdue = !task.completed && new Date(task.dueDate) < new Date() ? ' (Overdue)' : '';
    return `- ${task.title} (${subjectName}): ${status}${overdue}`;
  }).join('\n');

  const prompt = `
    As a study coach, analyze the following student data and provide actionable insights and recommendations.
    Be encouraging and concise. Format the output in Markdown.

    **Study Time Summary:**
    ${studySummary}

    **Task List:**
    ${taskSummary}

    Provide insights on which subject needs more focus, suggest what to work on next, and offer some motivation.
  `;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching insights from Gemini API:", error);
    return "There was an error generating insights. Please try again later.";
  }
};

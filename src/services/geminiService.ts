import { GoogleGenAI } from "@google/genai";

export const aiService = {
  async getRecommendation(symptoms: string): Promise<string> {
    const aiService = process.env.AI_SERVICE || "gemini";
    
    try {
      switch (aiService) {
        case "doubao":
          return await this.getDoubaoRecommendation(symptoms);
        case "deepseek":
          return await this.getDeepSeekRecommendation(symptoms);
        case "gemini":
        default:
          return await this.getGeminiRecommendation(symptoms);
      }
    } catch (error) {
      console.error("AI Service Error:", error);
      return this.mockResponse(symptoms);
    }
  },

  async getGeminiRecommendation(symptoms: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return this.mockResponse(symptoms);
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `你是一位幽默的中医神医，专门治疗“电子阳痿”（即买了游戏不想玩，或者玩一会儿就关掉的症状）。
        用户描述了他的症状："${symptoms}"
        请用中医的口吻，给出一段幽默的诊断，并推荐一种游戏类型（如肉鸽、放置、硬核动作等），解释为什么这种“药”能治好他。
        字数在150字以内，语气要搞笑、专业（中医范儿）、毒舌但温暖。`
      });
      return response.text || "神医累了，去后山采药了，你自己看着办吧。";
    } catch (error) {
      console.error("Gemini Error:", error);
      return this.mockResponse(symptoms);
    }
  },

  async getDoubaoRecommendation(symptoms: string): Promise<string> {
    const apiKey = process.env.DOUBAO_API_KEY;
    // 即使没有 API Key，也返回模拟响应，确保聊天功能正常工作
    if (!apiKey || apiKey === "MY_DOBAO_API_KEY") {
      console.log("使用豆包模拟响应");
      return this.mockResponse(symptoms);
    }

    try {
      console.log("使用豆包 API");
      const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "ep-20250317171023-t4m9j", // 豆包模型ID，可能需要根据实际情况调整
          messages: [
            {
              role: "system",
              content: "你是一位幽默的中医神医，专门治疗‘电子阳痿’（即买了游戏不想玩，或者玩一会儿就关掉的症状）。请用中医的口吻，给出幽默的诊断，并推荐一种游戏类型，解释为什么这种‘药’能治好他。字数在150字以内，语气要搞笑、专业（中医范儿）、毒舌但温暖。"
            },
            {
              role: "user",
              content: `用户描述了他的症状："${symptoms}"`
            }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      return data.choices[0].message.content || "神医累了，去后山采药了，你自己看着办吧。";
    } catch (error) {
      console.error("Doubao Error:", error);
      return this.mockResponse(symptoms);
    }
  },

  async getDeepSeekRecommendation(symptoms: string): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey === "MY_DEEPSEEK_API_KEY") {
      return this.mockResponse(symptoms);
    }

    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "你是一位幽默的中医神医，专门治疗‘电子阳痿’（即买了游戏不想玩，或者玩一会儿就关掉的症状）。请用中医的口吻，给出幽默的诊断，并推荐一种游戏类型，解释为什么这种‘药’能治好他。字数在150字以内，语气要搞笑、专业（中医范儿）、毒舌但温暖。"
            },
            {
              role: "user",
              content: `用户描述了他的症状："${symptoms}"`
            }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      return data.choices[0].message.content || "神医累了，去后山采药了，你自己看着办吧。";
    } catch (error) {
      console.error("DeepSeek Error:", error);
      return this.mockResponse(symptoms);
    }
  },

  mockResponse(symptoms: string): string {
    const mocks = [
      "看你这脉象，分明是‘大作过敏症’。别整天盯着那些4K光追了，你的心需要一点纯粹的像素。去玩个肉鸽（Roguelike）吧，死着死着你就活过来了。",
      "你这是‘赛博虚无主义’。游戏太多，反而不知道玩啥。我给你开个‘放置类’（Idle）的方子，让游戏自己玩，你负责看，主打一个陪伴。",
      "啧啧，典型的‘3A大作PTSD’。被那些开放世界塞满了？来点硬核动作游戏，用受苦来唤醒你沉睡的灵魂。痛，并快乐着，才是治愈的关键。",
      "你这不是阳痿，是‘选择困难性休克’。别挑了，随便开一个，玩进去就是赢。我推荐你试试射击类，突突突最解压。"
    ];
    return mocks[Math.floor(Math.random() * mocks.length)];
  }
};

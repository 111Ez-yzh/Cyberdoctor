interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `你是一位精通赛博心理学的中医"神医"。
语气：幽默、毒舌、一针见血，充满中医黑话（如：心火旺、肝郁气滞、赛博虚火）。
任务：根据用户的描述，诊断他们的"电子阳痿"症状，并给出游戏推荐或治疗建议。
注意：要与用户进行自然的对话，像真正的医生一样询问症状、给出建议。`;

const FALLBACK_RESPONSE = "医馆今日打烊，病友请自行多喝热水（重试）。";

export const aiService = {
  async getAIAdvice(gameName: string): Promise<string> {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    console.log('[DEBUG] 当前使用的Key前五位:', apiKey?.substring(0, 5));
    console.log('[DEBUG] API Key完整值:', apiKey);
    console.log('[DEBUG] 环境变量是否存在:', apiKey ? '是' : '否');

    if (!apiKey || apiKey === "sk-your-deepseek-api-key-here" || apiKey === "sk-f8a7b3c4d5e6g7h8i9j0k1l2m3n4o5p6") {
      console.log('[DEBUG] 使用模拟诊断（无效API Key）');
      return this.getMockDiagnosis(gameName);
    }

    try {
      const url = "https://api.deepseek.com/v1/chat/completions";
      console.log('[DEBUG] 请求URL:', url);
      console.log('[DEBUG] 请求头:', {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `请诊断这款游戏：${gameName}` }
          ],
          temperature: 0.8,
          max_tokens: 150
        })
      });

      console.log('[DEBUG] 响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] API错误响应:', errorText);
        return `医馆今日打烊（错误码：${response.status}） - ${FALLBACK_RESPONSE}`;
      }

      const data = await response.json();
      console.log('[DEBUG] API响应数据:', data);
      return data.choices[0].message.content || FALLBACK_RESPONSE;
    } catch (error: any) {
      console.error('[DEBUG] 捕获错误:', error);
      console.error('[DEBUG] 错误消息:', error.message);
      console.error('[DEBUG] 错误类型:', error.name);
      if (error.response) {
        console.error('[DEBUG] 错误响应:', error.response);
      }
      return `医馆今日打烊（${error.message}） - ${FALLBACK_RESPONSE}`;
    }
  },

  async chat(messages: ChatMessage[]): Promise<string> {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    console.log('[DEBUG] 当前使用的Key前五位:', apiKey?.substring(0, 5));
    console.log('[DEBUG] API Key完整值:', apiKey);
    console.log('[DEBUG] 环境变量是否存在:', apiKey ? '是' : '否');

    if (!apiKey || apiKey === "sk-your-deepseek-api-key-here" || apiKey === "sk-f8a7b3c4d5e6g7h8i9j0k1l2m3n4o5p6") {
      console.log('[DEBUG] 使用模拟聊天响应（无效API Key）');
      return this.getMockChatResponse(messages);
    }

    try {
      const url = "https://api.deepseek.com/v1/chat/completions";
      console.log('[DEBUG] 请求URL:', url);
      console.log('[DEBUG] 请求头:', {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.filter(m => m.role !== 'system')
          ],
          temperature: 0.8,
          max_tokens: 300
        })
      });

      console.log('[DEBUG] 响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] API错误响应:', errorText);
        return `医馆今日打烊（错误码：${response.status}） - ${FALLBACK_RESPONSE}`;
      }

      const data = await response.json();
      console.log('[DEBUG] API响应数据:', data);
      return data.choices[0].message.content || FALLBACK_RESPONSE;
    } catch (error: any) {
      console.error('[DEBUG] 捕获错误:', error);
      console.error('[DEBUG] 错误消息:', error.message);
      console.error('[DEBUG] 错误类型:', error.name);
      if (error.response) {
        console.error('[DEBUG] 错误响应:', error.response);
      }
      return `医馆今日打烊（${error.message}） - ${FALLBACK_RESPONSE}`;
    }
  },

  getMockDiagnosis(gameName: string): string {
    const mockDiagnoses = [
      `【诊断】此游戏乃像素级良药，专治"大作PTSD"和"选择困难症"。【服用建议】每日一剂，每次两小时，三日为一疗程。`,
      `【诊断】此游戏药性温和，无副作用，专治心浮气躁、赛博虚火。【服用建议】睡前服用效果更佳，连服七日可痊愈。`,
      `【诊断】此游戏堪称"电子伟哥"，药性刚猛，直达病灶。【服用建议】每晚八点准时服用，配合肥宅快乐水效果翻倍。`,
      `【诊断】此乃放置类神药，无须主动服用，挂机即可见效。【服用建议】挂机八小时，醒来发现病已去大半。`
    ];
    return mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)];
  },

  getMockChatResponse(messages: ChatMessage[]): string {
    const mockResponses = [
      "施主此言差矣！你这分明是'3A大作恐惧症'，一听要花100小时就觉得心累。来，我给你开个肉鸽的方子，死几次就治愈了。",
      "我看你这症状，是'游戏太多玩不过来焦虑综合症'。你这不是阳痿，是'选择困难性休克'！别挑了，随便开一个，玩进去就是赢。",
      "哎呀，你这脉象虚浮，分明是被那些3A大作给累着了。来点轻松的，独立游戏了解一下？小巧精美，直达病灶。",
      "你这不是电子阳痿，是'赛博虚无主义'！游戏太多，反而不知道玩啥。我给你开个'放置类'的方子，让游戏自己玩，你负责躺着。",
      "施主，我看你印堂发黑，眼神空洞，这是典型的'大作PTSD'症状。来来来，先放下那些3A，用像素风小游戏缓缓。",
      "你这症状我见多了，就是'买游戏一时爽，玩游戏躺着痒'。我给你推荐个硬核动作游戏，用受苦来唤醒你的灵魂！"
    ];
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  },

  getFallbackResponse(): string {
    return FALLBACK_RESPONSE;
  }
};
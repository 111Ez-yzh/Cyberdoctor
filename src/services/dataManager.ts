import { SteamGame } from '../types';

// 游戏数据类型
interface GameData {
  id: number;
  name: string;
  tags: string[];
  score: number;
  header_image: string;
  description: string;
  release_date: string;
}

// 标签映射表
const TAG_MAP: Record<string, string> = {
  'Action': '动作',
  'Indie': '独立',
  'Rogue-like': '肉鸽',
  'Roguelike': '肉鸽',
  'Role-playing': '角色扮演',
  'RPG': '角色扮演',
  'Strategy': '策略',
  'Simulation': '模拟',
  'Adventure': '冒险',
  'Puzzle': '解谜',
  'Casual': '休闲',
  'Multiplayer': '多人',
  'Singleplayer': '单人',
  'Co-op': '合作',
  'Competitive': '竞技',
  'Open World': '开放世界',
  'Story Rich': '剧情丰富',
  'Atmospheric': '氛围',
  'First-Person': '第一人称',
  'Third-Person': '第三人称',
  '2D': '2D',
  '3D': '3D',
  'Anime': '动漫',
  'Fantasy': '奇幻',
  'Sci-fi': '科幻',
  'Horror': '恐怖',
  'Survival': '生存',
  'Crafting': ' crafting',
  'Building': '建造',
  'Management': '管理',
  'Sports': '体育',
  'Racing': '竞速',
  'Fighting': '格斗',
  'Shooter': '射击',
  'Platformer': '平台',
  'Metroidvania': '类银河战士恶魔城',
  'Card Game': '卡牌游戏',
  'Turn-based': '回合制',
  'Real-time': '实时',
  'Tactical': '战术',
  'Stealth': '潜行',
  'Music': '音乐',
  'Education': '教育',
  'Early Access': '抢先体验'
};

// 病历记录类型
interface Record {
  gameId: string;
  gameName: string;
  timestamp: number;
  attitude: 'like' | 'dislike';
}

// 数据管理器类
class DataManager {
  private games: SteamGame[] = [];
  private loaded: boolean = false;
  private readonly STORAGE_KEYS = {
    HISTORY: 'gamecatcher_history',
    WEIGHTS: 'gamecatcher_tagWeights'
  };

  // 格式化标签
  private formatTag(tag: string): string {
    return TAG_MAP[tag] || tag;
  }

  // 加载游戏数据
  async loadGames(): Promise<SteamGame[]> {
    if (this.loaded && this.games.length > 0) {
      return this.games;
    }

    try {
      // 从 public 文件夹加载 JSON 文件
      const response = await fetch('/games_master.json');
      const gameData: GameData[] = await response.json();

      // 游戏名称中文翻译映射
      const gameNameMap: Record<string, string> = {
        'Counter-Strike: Global Offensive': '反恐精英：全球攻势',
        'Grand Theft Auto V Legacy': '侠盗猎车手5 传奇版',
        'PUBG: BATTLEGROUNDS': '绝地求生',
        'Terraria': '泰拉瑞亚',
        'Tom Clancy\'s Rainbow Six Siege': '彩虹六号：围攻',
        'Garry\'s Mod': '盖瑞模组',
        'Black Myth: Wukong': '黑神话：悟空',
        'Rust': '腐蚀',
        'Team Fortress 2': '军团要塞2',
        'ELDEN RING': '艾尔登法环',
        'Left 4 Dead 2': '求生之路2',
        'Wallpaper Engine': '壁纸引擎',
        'Stardew Valley': '星露谷物语',
        'Euro Truck Simulator 2': '欧洲卡车模拟2',
        'The Witcher 3: Wild Hunt': '巫师3：狂猎',
        'HELLDIVERS 2': '地狱潜兵2',
        'Baldur\'s Gate 3': '博德之门3',
        'Phasmophobia': '恐鬼症',
        'Cyberpunk 2077': '赛博朋克2077',
        'Red Dead Redemption 2': '荒野大镖客2',
        'Apex Legends': 'Apex英雄',
        'Among Us': '在我们之中',
        'Dead by Daylight': '黎明杀机',
        'ARK: Survival Evolved': '方舟：生存进化',
        'The Forest': '森林',
        'PAYDAY 2': '收获日2',
        'Warframe': '星际战甲',
        'Rocket League': '火箭联盟',
        'Unturned': '未转变者',
        'Destiny 2': '命运2',
        'War Thunder': '战争雷霆',
        'Don\'t Starve Together': '饥荒：联机版',
        'Lethal Company': '致命公司',
        'Valheim': '瓦尔海姆',
        'Dying Light': '消逝的光芒',
        'Monster Hunter: World': '怪物猎人：世界',
        'Portal 2': '传送门2',
        'Call of Duty: Modern Warfare II': '使命召唤：现代战争2',
        'Hollow Knight': '空洞骑士',
        'Geometry Dash': '几何冲刺',
        'DARK SOULS III': '黑暗之魂3',
        'Fall Guys: Ultimate Knockout': '糖豆人：终极淘汰赛',
        'Palworld': '幻兽帕鲁',
        'Project Zomboid': '僵尸毁灭工程',
        'Bloons TD 6': '气球塔防6',
        'The Binding of Isaac: Rebirth': '以撒的结合：重生',
        'Deep Rock Galactic': '深岩银河',
        'DayZ': '僵尸末日',
        '7 Days to Die': '七日杀',
        'Fallout 4': '辐射4',
        'Raft': '木筏生存',
        'Sea of Thieves: 2025 Edition': '盗贼之海：2025版',
        'Brawlhalla': '英灵乱战',
        'BeamNG.drive': 'BeamNG驾驶',
        'The Elder Scrolls V: Skyrim Special Edition': '上古卷轴5：天际 特别版',
        'Sekiro: Shadows Die Twice - GOTY Edition': '只狼：影逝二度 - 年度版',
        'Hearts of Iron IV': '钢铁雄心4',
        'Subnautica': '深海迷航',
        'Sid Meier\'s Civilization VI': '文明6',
        'The Elder Scrolls V: Skyrim': '上古卷轴5：天际',
        'Paladins': '枪火游侠',
        'No Man\'s Sky': '无人深空',
        'Risk of Rain 2': '雨中冒险2',
        'Hogwarts Legacy': '霍格沃茨遗产',
        'People Playground': '人类游乐场',
        'Hades': '哈迪斯',
        'Borderlands 2': '无主之地2',
        'Undertale': '传说之下',
        'Forza Horizon 4': '极限竞速：地平线4',
        'Cities: Skylines': '城市：天际线',
        'Arma 3': '武装突袭3',
        'Vampire Survivors': '吸血鬼幸存者',
        'Titanfall 2': '泰坦陨落2',
        'Counter-Strike': '反恐精英',
        'Half-Life 2': '半条命2',
        'Tomb Raider Game of the Year': '古墓丽影 年度版',
        'Mount & Blade II: Bannerlord': '骑马与砍杀2：霸主',
        'NARAKA: BLADEPOINT': '永劫无间',
        'Satisfactory': '幸福工厂',
        'Halo: The Master Chief Collection': '光环：士官长合集',
        'Sons Of The Forest': '森林之子',
        'Fallout: New Vegas': '辐射：新维加斯',
        'Ready or Not': '严阵以待',
        'Path of Exile': '流放之路',
        'Factorio': '异星工厂',
        'It Takes Two': '双人成行',
        'RimWorld': '环世界',
        'Doki Doki Literature Club!': '心跳文学部',
        'Human Fall Flat': '人类一败涂地',
        'Schedule I': '计划表I',
        'Forza Horizon 5': '极限竞速：地平线5',
        'DOOM': '毁灭战士',
        'New World: Aeternum': '新世界：永恒',
        'SCP: Secret Laboratory': 'SCP：秘密实验室',
        'Sid Meier\'s Civilization V': '文明5',
        'DOOM Eternal': '毁灭战士：永恒',
        'Divinity: Original Sin 2 - Definitive Edition': '神界：原罪2 - 终极版',
        'VRChat': 'VR聊天',
        'Call of Duty: Black Ops III': '使命召唤：黑色行动3',
        'Hunt: Showdown 1896': '猎杀：对决 1896',
        'Cuphead': '茶杯头',
        'R.E.P.O.': 'R.E.P.O.',
        'Slay the Spire': '杀戮尖塔',
        'Resident Evil 4': '生化危机4',
        'Battlefield V': '战地5',
        'Counter-Strike: Source': '反恐精英：起源',
        'Squad': '战术小队',
        'Portal': '传送门',
        'American Truck Simulator': '美国卡车模拟',
        'Resident Evil 2': '生化危机2',
        'Battlefield 1': '战地1',
        'ULTRAKILL': '终极杀戮',
        'Dead Cells': '死亡细胞',
        'Life is Strange - Episode 1': '奇异人生 - 第1章',
        'Mount & Blade: Warband': '骑马与砍杀：战团',
        'Detroit: Become Human': '底特律：变人',
        'Stellaris': '群星',
        'theHunter: Call of the Wild': '猎人：荒野的召唤',
        'Dying Light 2 Stay Human: Reloaded Edition': '消逝的光芒2：人与仁之战 - 重载版',
        'Age of Empires II: Definitive Edition': '帝国时代2：终极版',
        'Assassin\'s Creed Odyssey': '刺客信条：奥德赛',
        'Stray': '流浪',
        'Starbound': '星界边境',
        'God of War': '战神',
        'Balatro': '巴洛特',
        'The Sims 4': '模拟人生4',
        'Grand Theft Auto IV: Complete Edition': '侠盗猎车手4：完整版',
        'Grand Theft Auto IV: The Complete Edition': '侠盗猎车手4：完整版',
        'Lost Ark': '失落的方舟',
        'Half-Life': '半条命',
        'STAR WARS Jedi: Fallen Order': '星球大战绝地：陨落的武士团',
        'Far Cry 5': '孤岛惊魂5',
        'Devil May Cry 5': '鬼泣5',
        'Assetto Corsa': '神力科莎',
        'Crab Game': '螃蟹游戏',
        'Battlefield 2042': '战地2042',
        'Content Warning': '内容警告',
        'Darkest Dungeon': '暗黑地牢',
        'Plants vs. Zombies GOTY Edition': '植物大战僵尸 年度版',
        'Kingdom Come: Deliverance': '天国：拯救',
        'Slime Rancher': '史莱姆牧场',
        'Warhammer 40,000: Space Marine 2': '战锤40K：星际战士2',
        'Totally Accurate Battle Simulator': '全面战争模拟器',
        'Ori and the Will of the Wisps': '奥日与精灵意志',
        'BioShock Infinite': '生化奇兵：无限',
        'Rise of the Tomb Raider': '古墓丽影：崛起',
        'Inscryption': '密教模拟器',
        'Monster Hunter Wilds': '怪物猎人：荒野',
        'The Elder Scrolls Online': '上古卷轴Online',
        'DAVE THE DIVER': '潜水员戴夫',
        'Borderlands 3': '无主之地3',
        'Oxygen Not Included': '缺氧',
        'Batman: Arkham Knight': '蝙蝠侠：阿甘骑士',
        'Halo Infinite': '光环：无限',
        'Helltaker': '地狱把妹王',
        'NieR:Automata': '尼尔：机械纪元',
        'Black Mesa': '黑山',
        'Outlast': '逃生'
      };

      // 转换为 SteamGame 类型并去重
      const gameMap = new Map<string, SteamGame>();
      
      gameData.forEach(game => {
        // 为没有标签的游戏添加默认标签
        let tags = game.tags || [];
        if (tags.length === 0) {
          // 根据游戏名称和描述推断标签
          const name = game.name.toLowerCase();
          const desc = game.description.toLowerCase();
          
          // 更详细的标签推断逻辑，生成更多标签
          if (name.includes('counter-strike') || name.includes('cs:') || name.includes('shooter') || name.includes('fps') || desc.includes('shooter')) {
            tags = ['Action', 'Shooter', 'Multiplayer', 'Competitive', 'First-Person', 'Tactical'];
          } else if (name.includes('grand theft auto') || name.includes('gta') || name.includes('open world')) {
            tags = ['Action', 'Open World', 'Adventure', 'Third-Person', 'Multiplayer', 'Story Rich'];
          } else if (name.includes('rpg') || name.includes('role-playing') || name.includes('elder scrolls') || name.includes('witcher')) {
            tags = ['RPG', 'Open World', 'Adventure', 'Fantasy', 'Story Rich', 'Singleplayer'];
          } else if (name.includes('strategy') || name.includes('tactical') || name.includes('civilization') || name.includes('hearts of iron')) {
            tags = ['Strategy', 'Simulation', 'Tactical', 'Singleplayer', 'Multiplayer', 'History'];
          } else if (name.includes('simulation') || name.includes('simulator') || name.includes('truck') || name.includes('farming')) {
            tags = ['Simulation', 'Strategy', 'Management', 'Singleplayer', 'Open World', 'Relaxing'];
          } else if (name.includes('adventure') || name.includes('tomb raider') || name.includes('uncharted')) {
            tags = ['Adventure', 'Action', 'Third-Person', 'Story Rich', 'Singleplayer', 'Exploration'];
          } else if (name.includes('puzzle') || name.includes('portal') || name.includes('myst')) {
            tags = ['Puzzle', 'Adventure', 'Singleplayer', 'First-Person', 'Brain Teaser', 'Logic'];
          } else if (name.includes('indie') || name.includes('stardew valley') || name.includes('hollow knight')) {
            tags = ['Indie', 'Adventure', 'Singleplayer', '2D', 'Story Rich', 'Atmospheric'];
          } else if (name.includes('racing') || name.includes('forza') || name.includes('need for speed')) {
            tags = ['Racing', 'Simulation', 'Multiplayer', 'Competitive', 'Arcade', 'Open World'];
          } else if (name.includes('fighting') || name.includes('street fighter') || name.includes('tekken')) {
            tags = ['Fighting', 'Action', 'Multiplayer', 'Competitive', 'Arcade', '2D'];
          } else if (name.includes('survival') || name.includes('rust') || name.includes('ark') || name.includes('zombie')) {
            tags = ['Survival', 'Action', 'Open World', 'Multiplayer', 'Crafting', 'Building'];
          } else if (name.includes('platformer') || name.includes('mario') || name.includes('celeste')) {
            tags = ['Platformer', 'Indie', 'Singleplayer', '2D', 'Precision', 'Challenging'];
          } else if (name.includes('casual') || name.includes('match') || name.includes('solitaire')) {
            tags = ['Casual', 'Puzzle', 'Singleplayer', 'Relaxing', 'Family Friendly', 'Quick Play'];
          } else {
            // 根据开发者和发行商推断
            if (desc.includes('valve')) {
              tags = ['Action', 'Multiplayer', 'First-Person', 'Shooter', 'Competitive', 'Team-Based'];
            } else if (desc.includes('rockstar')) {
              tags = ['Action', 'Open World', 'Adventure', 'Third-Person', 'Story Rich', 'Multiplayer'];
            } else if (desc.includes('bethesda')) {
              tags = ['RPG', 'Open World', 'Adventure', 'Fantasy', 'Singleplayer', 'Story Rich'];
            } else if (desc.includes('capcom')) {
              tags = ['Action', 'Adventure', 'Third-Person', 'Singleplayer', 'Story Rich', 'Fantasy'];
            } else if (desc.includes('ubisoft')) {
              tags = ['Action', 'Open World', 'Adventure', 'Third-Person', 'Multiplayer', 'Story Rich'];
            } else {
              tags = ['Action', 'Adventure', 'Singleplayer', 'Story Rich', 'Third-Person', 'Fantasy'];
            }
          }
        }
        
        // 获取中文名称，若没有翻译则使用原英文名称
        const chineseName = gameNameMap[game.name] || game.name;
        
        // 添加到映射中，自动去重（使用id作为键）
        gameMap.set(game.id.toString(), {
          id: game.id.toString(),
          name: chineseName,
          imgUrl: game.header_image,
          reviewScore: game.score.toFixed(2),
          tags: tags.map(tag => this.formatTag(tag)),
          description: game.description,
          releaseDate: game.release_date
        });
      });
      
      // 转换为数组
      this.games = Array.from(gameMap.values());

      this.loaded = true;
      return this.games;
    } catch (error) {
      console.error('Failed to load games:', error);
      return [];
    }
  }

  // 获取所有游戏
  async getAllGames(): Promise<SteamGame[]> {
    return this.loadGames();
  }

  // 根据标签筛选游戏
  async getGamesByTag(tag: string): Promise<SteamGame[]> {
    const games = await this.loadGames();
    return games.filter(game => game.tags?.includes(tag) || false);
  }

  // 获取所有唯一标签
  async getAllTags(): Promise<string[]> {
    const games = await this.loadGames();
    const tagSet = new Set<string>();
    
    games.forEach(game => {
      game.tags?.forEach(tag => tagSet.add(tag));
    });
    
    return Array.from(tagSet).sort();
  }

  // 加权随机筛选游戏
  async getWeightedRandomGames(count: number, tagWeights: Record<string, number>): Promise<SteamGame[]> {
    const games = await this.loadGames();
    
    // 计算每个游戏的权重分数
    const weightedGames = games.map(game => {
      // 基础权重为1.0
      let baseWeight = 1.0;
      
      // 计算标签权重
      if (game.tags && game.tags.length > 0) {
        // 使用第一个标签作为主要标签计算权重
        const mainTag = game.tags[0];
        const tagWeight = tagWeights[mainTag] || 1;
        baseWeight += tagWeight;
      }
      
      // 确保权重不为负数
      baseWeight = Math.max(0.1, baseWeight);
      
      return {
        game,
        weight: baseWeight,
        score: baseWeight * Math.random()
      };
    });

    // 按分数排序并取前 count 个
    weightedGames.sort((a, b) => b.score - a.score);
    return weightedGames.slice(0, count).map(item => item.game);
  }

  // 添加病历记录
  addToHistory(game: SteamGame, attitude: 'like' | 'dislike'): void {
    const history = this.getHistory();
    
    // 创建新记录
    const newRecord: Record = {
      gameId: game.id,
      gameName: game.name,
      timestamp: Date.now(),
      attitude
    };
    
    // 添加到历史记录
    history.unshift(newRecord);
    
    // 保存到localStorage
    localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }

  // 更新标签权重
  updateWeights(tags: string[], delta: number): void {
    const weights = this.getWeights();
    
    // 更新每个标签的权重
    tags.forEach(tag => {
      if (!weights[tag]) {
        weights[tag] = 1.0;
      }
      weights[tag] += delta;
      
      // 确保权重不为负数
      weights[tag] = Math.max(0.1, weights[tag]);
    });
    
    // 保存到localStorage
    localStorage.setItem(this.STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));
  }

  // 获取病历记录
  getHistory(): Record[] {
    try {
      const history = localStorage.getItem(this.STORAGE_KEYS.HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  }

  // 获取标签权重
  getWeights(): Record<string, number> {
    try {
      const weights = localStorage.getItem(this.STORAGE_KEYS.WEIGHTS);
      return weights ? JSON.parse(weights) : {};
    } catch (error) {
      console.error('Failed to get weights:', error);
      return {};
    }
  }

  // 初始化默认权重（如果localStorage为空）
  initDefaultWeights(): void {
    const weights = this.getWeights();
    if (Object.keys(weights).length === 0) {
      // 设置默认权重
      const defaultWeights: Record<string, number> = {
        '动作': 1.0,
        '独立': 1.0,
        '肉鸽': 1.0,
        '角色扮演': 1.0,
        '策略': 1.0,
        '模拟': 1.0,
        '冒险': 1.0,
        '解谜': 1.0,
        '休闲': 1.0,
        '多人': 1.0,
        '单人': 1.0,
        '合作': 1.0,
        '竞技': 1.0,
        '开放世界': 1.0,
        '剧情丰富': 1.0,
        '氛围': 1.0,
        '第一人称': 1.0,
        '第三人称': 1.0,
        '2D': 1.0,
        '3D': 1.0,
        '动漫': 1.0,
        '奇幻': 1.0,
        '科幻': 1.0,
        '恐怖': 1.0,
        '生存': 1.0,
        '建造': 1.0,
        '管理': 1.0,
        '体育': 1.0,
        '竞速': 1.0,
        '格斗': 1.0,
        '射击': 1.0,
        '平台': 1.0,
        '类银河战士恶魔城': 1.0,
        '卡牌游戏': 1.0,
        '回合制': 1.0,
        '实时': 1.0,
        '战术': 1.0,
        '潜行': 1.0,
        '音乐': 1.0,
        '教育': 1.0,
        '抢先体验': 1.0
      };
      localStorage.setItem(this.STORAGE_KEYS.WEIGHTS, JSON.stringify(defaultWeights));
    }
  }
}

// 导出单例实例
export const dataManager = new DataManager();

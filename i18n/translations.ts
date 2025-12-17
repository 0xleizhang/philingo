// 支持的语言类型
export type Language = 'zh' | 'ja' | 'vi';

// 翻译类型定义
export interface Translations {
  // WordTooltip
  wordTooltip: {
    syllables: string;
    roots: string;
    affixes: string;
    synonyms: string;
    analysis: string;
    antonyms: string;
    associations: string;
    phrases: string;
  };
  
  // FeedbackPanel
  feedbackPanel: {
    title: string;
    emptyTitle: string;
    emptySubtitle: string;
    clearAll: string;
    playRecording: string;
    stopPlaying: string;
    needsAttention: string;
    clickToPronounce: string;
  };
  
  // WritingMode
  writingMode: {
    title: string;
    description: string;
    reset: string;
    correct: string;
    allCorrect: string;
    noWordsTitle: string;
    noWordsMessage: string;
    inputPlaceholder: string;
  };
  
  // ApiKeyModal
  apiKeyModal: {
    title: string;
    aiProvider: string;
    apiKeyLabel: string;
    securityNote: string;
    getKeyMessage: string;
    noConfigTitle: string;
    noConfigMessage: string;
    fillForm: string;
    saveButton: string;
  };
  
  // App
  app: {
    tagline: string;
    explore: string;
    about: string;
    configureApiKey: string;
    createLink: string;
    linkCopied: string;
    editText: string;
    cancel: string;
    startReading: string;
    apiKeyRequired: string;
    apiKeyRequiredDesc: string;
    configure: string;
    inputTitle: string;
    format: string;
    inputPlaceholder: string;
    inputHint: string;
    chars: string;
    errorPrefix: string;
  };
}

// 中文翻译
const zh: Translations = {
  wordTooltip: {
    syllables: '音节',
    roots: '词根',
    affixes: '词缀',
    synonyms: '近义词',
    analysis: '辨析',
    antonyms: '反义词',
    associations: '联想',
    phrases: '词组'
  },
  feedbackPanel: {
    title: '发音反馈',
    emptyTitle: '点击左侧句子开始测试发音',
    emptySubtitle: '录音将自动结束',
    clearAll: '清除所有反馈',
    playRecording: '播放录音',
    stopPlaying: '停止播放',
    needsAttention: '需要注意',
    clickToPronounce: '点击发音'
  },
  writingMode: {
    title: '写作练习',
    description: '填写正确的单词。需要{count}次正确答案才能掌握。',
    reset: '重置',
    correct: '正确',
    allCorrect: '全部正确！',
    noWordsTitle: '没有需要练习的单词！',
    noWordsMessage: '所有查看过的单词都已掌握，或者您还没有查看任何单词。\n切换到阅读模式并点击单词来查看它们。',
    inputPlaceholder: '在此输入...'
  },
  apiKeyModal: {
    title: '配置 API Key',
    aiProvider: 'AI 提供商',
    apiKeyLabel: 'API 密钥',
    securityNote: '您的密钥存储在浏览器本地，直接发送到{provider}服务器。',
    getKeyMessage: '还没有密钥？在以下网站免费获取：',
    noConfigTitle: '🚀 不想自己配置 API Key？',
    noConfigMessage: '我们正在开发免配置版本，直接使用无需任何设置。想要第一时间体验？请',
    fillForm: '填写表单',
    saveButton: '保存密钥'
  },
  app: {
    tagline: '— practice makes perfect',
    explore: '探索文本',
    about: '关于',
    configureApiKey: '配置 API Key',
    createLink: '创建分享链接',
    linkCopied: '链接已复制！',
    editText: '编辑文本',
    cancel: '取消',
    startReading: '开始阅读',
    apiKeyRequired: '需要 API Key',
    apiKeyRequiredDesc: '您需要配置 API Key 才能使用分析功能。',
    configure: '配置',
    inputTitle: '输入英语文本',
    format: '格式化',
    inputPlaceholder: '在此粘贴您的英语文本...',
    inputHint: '粘贴一篇文章、一段话或句子来练习。',
    chars: '字符',
    errorPrefix: '错误'
  }
};

// 日语翻译
const ja: Translations = {
  wordTooltip: {
    syllables: '音節',
    roots: '語根',
    affixes: '接辞',
    synonyms: '類義語',
    analysis: '分析',
    antonyms: '反義語',
    associations: '連想',
    phrases: 'フレーズ'
  },
  feedbackPanel: {
    title: '発音フィードバック',
    emptyTitle: '左側の文をクリックして発音テストを開始',
    emptySubtitle: '録音は自動的に終了します',
    clearAll: 'すべてのフィードバックをクリア',
    playRecording: '録音を再生',
    stopPlaying: '再生を停止',
    needsAttention: '注意が必要',
    clickToPronounce: 'クリックして発音'
  },
  writingMode: {
    title: 'ライティング練習',
    description: '正しい単語を入力してください。マスターするには{count}回の正解が必要です。',
    reset: 'リセット',
    correct: '正解',
    allCorrect: 'すべて正解！',
    noWordsTitle: '練習する単語がありません！',
    noWordsMessage: '閲覧したすべての単語がマスター済みか、まだ単語を閲覧していません。\n読書モードに切り替えて単語をクリックしてください。',
    inputPlaceholder: 'ここに入力...'
  },
  apiKeyModal: {
    title: 'API キー設定',
    aiProvider: 'AI プロバイダー',
    apiKeyLabel: 'API キー',
    securityNote: 'キーはブラウザにローカル保存され、{provider}サーバーに直接送信されます。',
    getKeyMessage: 'キーをお持ちでない場合は、以下から無料で取得できます：',
    noConfigTitle: '🚀 API キーを自分で設定したくないですか？',
    noConfigMessage: '設定不要のバージョンを開発中です。設定なしで直接使用できます。いち早く体験したい場合は、',
    fillForm: 'フォームに記入',
    saveButton: 'キーを保存'
  },
  app: {
    tagline: '— practice makes perfect',
    explore: 'テキストを探索',
    about: '概要',
    configureApiKey: 'API キー設定',
    createLink: 'シェアリンクを作成',
    linkCopied: 'リンクをコピーしました！',
    editText: 'テキストを編集',
    cancel: 'キャンセル',
    startReading: '読書を開始',
    apiKeyRequired: 'API キーが必要',
    apiKeyRequiredDesc: '分析機能を使用するには API キーを設定する必要があります。',
    configure: '設定',
    inputTitle: '英語のテキストを入力',
    format: 'フォーマット',
    inputPlaceholder: 'ここに英語のテキストを貼り付けてください...',
    inputHint: '記事、段落、または文を貼り付けて練習してください。',
    chars: '文字',
    errorPrefix: 'エラー'
  }
};

// 越南语翻译
const vi: Translations = {
  wordTooltip: {
    syllables: 'Âm tiết',
    roots: 'Từ gốc',
    affixes: 'Tiền/Hậu tố',
    synonyms: 'Từ đồng nghĩa',
    analysis: 'Phân tích',
    antonyms: 'Từ trái nghĩa',
    associations: 'Liên tưởng',
    phrases: 'Cụm từ'
  },
  feedbackPanel: {
    title: 'Phản hồi phát âm',
    emptyTitle: 'Nhấp vào câu bên trái để bắt đầu kiểm tra phát âm',
    emptySubtitle: 'Ghi âm sẽ tự động kết thúc',
    clearAll: 'Xóa tất cả phản hồi',
    playRecording: 'Phát ghi âm',
    stopPlaying: 'Dừng phát',
    needsAttention: 'Cần chú ý',
    clickToPronounce: 'Nhấp để phát âm'
  },
  writingMode: {
    title: 'Luyện viết',
    description: 'Điền từ đúng. Cần {count} câu trả lời đúng để thành thạo.',
    reset: 'Đặt lại',
    correct: 'Đúng',
    allCorrect: 'Tất cả đúng!',
    noWordsTitle: 'Không có từ nào để luyện tập!',
    noWordsMessage: 'Tất cả các từ đã xem đều đã thành thạo hoặc bạn chưa xem từ nào.\nChuyển sang chế độ đọc và nhấp vào các từ để xem chúng.',
    inputPlaceholder: 'Nhập vào đây...'
  },
  apiKeyModal: {
    title: 'Cấu hình API Key',
    aiProvider: 'Nhà cung cấp AI',
    apiKeyLabel: 'Khóa API',
    securityNote: 'Khóa của bạn được lưu cục bộ trong trình duyệt và gửi trực tiếp đến máy chủ {provider}.',
    getKeyMessage: 'Chưa có khóa? Nhận miễn phí tại:',
    noConfigTitle: '🚀 Không muốn tự cấu hình API Key?',
    noConfigMessage: 'Chúng tôi đang phát triển phiên bản không cần cấu hình, sử dụng trực tiếp mà không cần thiết lập. Muốn trải nghiệm đầu tiên?',
    fillForm: 'Điền vào biểu mẫu',
    saveButton: 'Lưu khóa'
  },
  app: {
    tagline: '— practice makes perfect',
    explore: 'Khám phá văn bản',
    about: 'Giới thiệu',
    configureApiKey: 'Cấu hình API Key',
    createLink: 'Tạo liên kết chia sẻ',
    linkCopied: 'Đã sao chép liên kết!',
    editText: 'Chỉnh sửa văn bản',
    cancel: 'Hủy',
    startReading: 'Bắt đầu đọc',
    apiKeyRequired: 'Cần API Key',
    apiKeyRequiredDesc: 'Bạn cần cấu hình API Key để sử dụng các tính năng phân tích.',
    configure: 'Cấu hình',
    inputTitle: 'Nhập văn bản tiếng Anh',
    format: 'Định dạng',
    inputPlaceholder: 'Dán văn bản tiếng Anh của bạn vào đây...',
    inputHint: 'Dán một bài báo, đoạn văn hoặc câu để luyện tập.',
    chars: 'ký tự',
    errorPrefix: 'Lỗi'
  }
};

// 导出所有翻译
export const translations: Record<Language, Translations> = {
  zh,
  ja,
  vi
};

// 语言显示名称
export const languageNames: Record<Language, string> = {
  zh: '中文',
  ja: '日本語',
  vi: 'Tiếng Việt'
};

// 语言对应的国旗 emoji
export const languageFlags: Record<Language, string> = {
  zh: '🇨🇳',
  ja: '🇯🇵',
  vi: '🇻🇳'
};

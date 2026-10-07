export type Lang = "fa" | "en";

type Entry = { fa: string; en: string };

export const dict = {
  appName: { fa: "تارون | همیار درسی هوشمند", en: "Tarven | AI Study Tutor" },
  appTagline: {
    fa: "یادگیری با هوش مصنوعی، گام‌به‌گام با کتاب درسی تو",
    en: "Learn with AI, step by step with your own textbook",
  },
  loading: { fa: "کمی صبر کن…", en: "Just a moment…" },
  retry: { fa: "تلاش دوباره", en: "Retry" },
  errorGeneric: { fa: "خطایی رخ داد. دوباره تلاش کن.", en: "Something went wrong. Please try again." },
  back: { fa: "بازگشت", en: "Back" },
  next: { fa: "بعدی", en: "Next" },
  optional: { fa: "اختیاری", en: "optional" },
  notFound: { fa: "پیدا نشد.", en: "Not found." },

  onbTitle: { fa: "به تارون خوش آمدی!", en: "Welcome to Tarven!" },
  onbSub: {
    fa: "همیار هوشمند درسی‌ات: توضیح گام‌به‌گام، رفع اشکال و آزمون‌های نمونه",
    en: "Your smart study buddy: step-by-step tutoring, Q&A and sample exams",
  },
  onbLangTitle: { fa: "زبان برنامه را انتخاب کن", en: "Choose your language" },
  onbKeyTitle: { fa: "کلید API هوش مصنوعی", en: "AI API Key" },
  onbKeyDesc: {
    fa: "کلید یک سرویس سازگار با OpenAI را وارد کن. کلید نداری؟ نگران نباش، از هوش مصنوعی دموی داخلی استفاده می‌شود.",
    en: "Enter an OpenAI-compatible API key. No key? No problem — the built-in demo AI will be used.",
  },
  onbKeyPh: { fa: "sk-… (اختیاری)", en: "sk-… (optional)" },
  onbDemoBadge: { fa: "حالت دمو فعال می‌شود", en: "Demo mode will be used" },
  onbGradeTitle: { fa: "پایه تحصیلی‌ات را انتخاب کن", en: "Select your grade" },
  onbDoneTitle: { fa: "همه چیز آماده است!", en: "You're all set!" },
  onbDoneSub: {
    fa: "کتاب‌های درسی‌ات را بارگذاری کن تا هوش مصنوعی آن‌ها را تحلیل کند.",
    en: "Upload your textbooks so the AI can analyze them for you.",
  },
  finish: { fa: "شروع کنیم!", en: "Let's go!" },

  grade_7: { fa: "پایه هفتم", en: "Grade 7" },
  grade_8: { fa: "پایه هشتم", en: "Grade 8" },
  grade_9: { fa: "پایه نهم", en: "Grade 9" },
  grade_10: { fa: "پایه دهم", en: "Grade 10" },
  grade_11: { fa: "پایه یازدهم", en: "Grade 11" },
  grade_12: { fa: "پایه دوازدهم", en: "Grade 12" },

  navHome: { fa: "خانه", en: "Home" },
  navBooks: { fa: "کتاب‌ها", en: "Books" },
  navTests: { fa: "آزمون‌ها", en: "Tests" },
  navSettings: { fa: "تنظیمات", en: "Settings" },

  homeGreeting: { fa: "سلام! 👋", en: "Hi there! 👋" },
  homeHero: {
    fa: "امروز چه درسی را پیش می‌بریم؟",
    en: "What are we studying today?",
  },
  featureStep: { fa: "گام‌به‌گام", en: "Step-by-Step" },
  featureStepD: {
    fa: "تحلیل صفحه‌به‌صفحه کتاب، بدون دادن جواب مستقیم",
    en: "Page-by-page analysis — never hands you direct answers",
  },
  featureExplain: { fa: "توضیح و گفتگو", en: "Explain & Chat" },
  featureExplainD: {
    fa: "موضوع را انتخاب کن و درباره‌اش با هوش مصنوعی گفتگو کن",
    en: "Pick a topic and discuss it with the AI tutor",
  },
  featureTest: { fa: "آزمون نمونه", en: "Sample Tests" },
  featureTestD: {
    fa: "جستجوی سوالات سال‌های قبل و ساخت آزمون جدید",
    en: "Searches past exam questions and builds a fresh test",
  },
  myBooks: { fa: "کتاب‌های من", en: "My Books" },
  noBooksYet: { fa: "هنوز کتابی نداری.", en: "No books yet." },
  addFirstBook: { fa: "اولین کتابت را اضافه کن", en: "Add your first book" },
  recentTests: { fa: "آزمون‌های اخیر", en: "Recent tests" },
  noTestsYet: { fa: "هنوز آزمونی نساخته‌ای.", en: "No tests yet." },
  viewAll: { fa: "همه", en: "See all" },

  booksTitle: { fa: "کتاب‌های من", en: "My Books" },
  booksSub: {
    fa: "فایل هر کتاب درسی را بارگذاری کن تا هوش مصنوعی آن را تحلیل کند.",
    en: "Upload each textbook file so the AI can analyze it.",
  },
  newBook: { fa: "کتاب جدید", en: "New book" },
  bookTitlePh: { fa: "مثلاً: ریاضی هفتم", en: "e.g. Math Grade 7" },
  subjectPh: { fa: "درس (مثلاً ریاضی)", en: "Subject (e.g. Math)" },
  chooseFile: { fa: "انتخاب فایل کتاب (PDF / TXT)", en: "Choose book file (PDF / TXT)" },
  fileSelected: { fa: "فایل انتخاب شد", en: "File selected" },
  uploading: { fa: "در حال بارگذاری…", en: "Uploading…" },
  uploadBtn: { fa: "بارگذاری و تحلیل", en: "Upload & analyze" },
  sampleBtn: { fa: "بارگذاری کتاب نمونه", en: "Load sample book" },
  sampleDesc: {
    fa: "برای تست سریع، یک فصل نمونه ریاضی اضافه می‌کند.",
    en: "Adds a sample math chapter for a quick test.",
  },
  uploadOk: { fa: "کتاب بارگذاری شد؛ تحلیل شروع شد.", en: "Book uploaded; analysis started." },
  uploadFail: { fa: "بارگذاری ناموفق بود.", en: "Upload failed." },
  parseFail: { fa: "خواندن متن فایل ممکن نشد.", en: "Could not extract text from the file." },
  analyzing: { fa: "هوش مصنوعی در حال تحلیل کتاب…", en: "AI is analyzing the book…" },
  analysisFail: { fa: "تحلیل ناموفق بود.", en: "Analysis failed." },
  pagesCount: { fa: "صفحه", en: "pages" },
  lessonsCount: { fa: "درس", en: "lessons" },
  ready: { fa: "آماده", en: "Ready" },
  processing: { fa: "در حال تحلیل", en: "Analyzing" },
  errorStatus: { fa: "خطا", en: "Error" },
  deleteBook: { fa: "حذف کتاب", en: "Delete book" },
  bookDeleted: { fa: "کتاب حذف شد.", en: "Book deleted." },

  bookLessons: { fa: "درس‌ها و موضوعات", en: "Lessons & topics" },
  bookPages: { fa: "صفحات کتاب", en: "Book pages" },
  pickPage: { fa: "انتخاب صفحه…", en: "Pick a page…" },
  pagePreview: { fa: "پیش‌نمایش صفحه", en: "Page preview" },
  startStep: { fa: "گام‌به‌گام این صفحه", en: "Step-by-step this page" },
  explainTopic: { fa: "توضیح این موضوع", en: "Explain this topic" },
  topicsLabel: { fa: "موضوعات", en: "Topics" },
  lessonPages: { fa: "صفحات", en: "Pages" },

  stepTitle: { fa: "گام‌به‌گام", en: "Step-by-Step" },
  stepSub: {
    fa: "کتاب و صفحه را انتخاب کن؛ توضیح کامل و مفهومی می‌گیری — بدون جواب مستقیم تمرین‌ها.",
    en: "Pick a book & page; get a thorough, friendly walkthrough — never direct answers.",
  },
  explainTitle: { fa: "توضیح و گفتگو", en: "Explain & Chat" },
  explainSub: {
    fa: "کتاب و موضوع را انتخاب کن و درباره‌اش گفتگو کن.",
    en: "Pick a book & topic and start the conversation.",
  },
  selectBook: { fa: "انتخاب کتاب…", en: "Select a book…" },
  noReadyBooks: {
    fa: "هنوز کتاب تحلیل‌شده‌ای نداری. اول از بخش کتاب‌ها یک کتاب اضافه کن.",
    en: "No analyzed books yet. Add one in the Books tab first.",
  },
  choosePage: { fa: "صفحه را انتخاب کن", en: "Choose a page" },
  chooseTopic: { fa: "موضوع را انتخاب کن", en: "Choose a topic" },
  customTopicPh: { fa: "یا موضوع دلخواهت را بنویس…", en: "Or type your own topic…" },
  chatPhStep: { fa: "سؤات را درباره این صفحه بپرس…", en: "Ask anything about this page…" },
  chatPhExplain: { fa: "پیامت را بنویس…", en: "Type your message…" },
  send: { fa: "ارسال", en: "Send" },
  thinking: { fa: "در حال فکر کردن…", en: "Thinking…" },
  clearChat: { fa: "گفتگوی جدید", en: "New chat" },
  aiNote: {
    fa: "هوش مصنوعی پاسخ مستقیم تمرین‌ها را نمی‌دهد؛ به تو یاد می‌دهد چطور حل کنی!",
    en: "The AI never hands out direct answers — it teaches you how to solve!",
  },
  showPage: { fa: "صفحه", en: "Page" },

  testsTitle: { fa: "آزمون نمونه", en: "Sample Test" },
  testsSub: {
    fa: "از اینترنت سوالات سال‌های قبل جمع می‌شود و یک آزمون تازه ساخته می‌شود.",
    en: "Past exam questions are gathered from the web and a fresh test is built.",
  },
  examMode: { fa: "نوع آزمون", en: "Exam type" },
  modeTopic: { fa: "موضوع خاص", en: "Specific topic" },
  modeMidterm: { fa: "امتحان نوبت اول", en: "Midterm exam" },
  modeFinal: { fa: "امتحان پایان سال", en: "Final exam" },
  subjectLabel: { fa: "درس", en: "Subject" },
  topicLabel: { fa: "موضوع", en: "Topic" },
  topicPh: { fa: "مثلاً اعداد صحیح", en: "e.g. Integers" },
  useBookContext: { fa: "هم‌راستا با کتاب من", en: "Aligned with my book" },
  generate: { fa: "ساخت آزمون", en: "Generate test" },
  generating: { fa: "در حال ساخت آزمون…", en: "Building your test…" },
  searchWeb: { fa: "جستجوی سوالات سال‌های قبل در وب…", en: "Searching the web for past questions…" },
  question: { fa: "سؤال", en: "Question" },
  ofQ: { fa: "از", en: "of" },
  yourAnswer: { fa: "پاسخ تو", en: "Your answer" },
  shortAnswerPh: { fa: "پاسخت را بنویس…", en: "Write your answer…" },
  needHelp: { fa: "کمک می‌خوام", en: "I need help" },
  gettingHint: { fa: "در حال راهنمایی…", en: "Getting a hint…" },
  checkAnswer: { fa: "بررسی پاسخ", en: "Check answer" },
  feedback: { fa: "بازخورد", en: "Feedback" },
  submit: { fa: "پایان و نمایش نتیجه", en: "Finish & see results" },
  resultsTitle: { fa: "نتیجه آزمون", en: "Test results" },
  scoreLabel: { fa: "امتیاز تو", en: "Your score" },
  correctAns: { fa: "پاسخ درست", en: "Correct answer" },
  retake: { fa: "آزمون مجدد", en: "Retake" },
  newTest: { fa: "آزمون جدید", en: "New test" },
  testSaved: { fa: "آزمون ذخیره شد.", en: "Test saved." },
  answerFirst: { fa: "اول به همه سؤال‌ها پاسخ بده.", en: "Answer all questions first." },
  hintLabel: { fa: "راهنما", en: "Hint" },

  setTitle: { fa: "تنظیمات", en: "Settings" },
  languageLabel: { fa: "زبان", en: "Language" },
  gradeLabel: { fa: "پایه تحصیلی", en: "Grade" },
  keyLabel: { fa: "کلید API", en: "API key" },
  keyNewPh: { fa: "برای تغییر، کلید جدید را وارد کن", en: "Enter a new key to replace" },
  baseUrlLabel: { fa: "آدرس پایه سرویس (OpenAI-Safe)", en: "API base URL (OpenAI-compatible)" },
  modelLabel: { fa: "نام مدل", en: "Model name" },
  saveSettings: { fa: "ذخیره تنظیمات", en: "Save settings" },
  saved: { fa: "ذخیره شد ✔", en: "Saved ✔" },
  testConn: { fa: "تست اتصال", en: "Test connection" },
  testing: { fa: "در حال تست…", en: "Testing…" },
  testOk: { fa: "اتصال به سرویس شما موفق بود ✔", en: "Your AI provider works ✔" },
  testDemo: {
    fa: "کلیدی ست نشده — هوش مصنوعی دمو استفاده می‌شود.",
    en: "No key set — the built-in demo AI will be used.",
  },
  testFail: { fa: "اتصال ناموفق — از هوش مصنوعی دمو استفاده می‌شود:", en: "Connection failed — the demo AI will be used:" },
  dangerZone: { fa: "منطقه خطر", en: "Danger zone" },
  resetAll: { fa: "پاک کردن همه داده‌ها", en: "Erase all data" },
  resetConfirm: {
    fa: "همه کتاب‌ها، گفتگوها و آزمون‌ها پاک شوند؟",
    en: "Delete all books, chats and tests?",
  },
  resetDone: { fa: "همه داده‌ها پاک شد.", en: "All data erased." },
  providerNote: {
    fa: "اگر کلید API ست شده باشد از سرویس خودت استفاده می‌شود؛ اگر سرویس در دسترس نباشد، خودکار به هوش مصنوعی دمو برمی‌گردیم تا برنامه همیشه کار کند.",
    en: "If an API key is set, your own provider is used; if it is unreachable, the app automatically falls back to the demo AI so it always works.",
  },
  about: { fa: "درباره", en: "About" },
  aboutText: {
    fa: "تارون نسخه ۱.۰.۰ — همیار هوشمند درسی با سه حالت گام‌به‌گام، توضیح و آزمون نمونه.",
    en: "Tarven v1.0.0 — AI study tutor with Step-by-Step, Explain and Sample Test modes.",
  },
} satisfies Record<string, Entry>;

export type DictKey = keyof typeof dict;

export function makeT(lang: Lang) {
  return (k: DictKey): string => dict[k][lang];
}

export const faGradeNames: Record<string, string> = {
  "7": "هفتم",
  "8": "هشتم",
  "9": "نهم",
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
};

export const gradeCodes = ["7", "8", "9", "10", "11", "12"] as const;

export function gradeLabel(code: string, lang: Lang): string {
  const k = `grade_${code}` as DictKey;
  return dict[k]?.[lang] ?? code;
}

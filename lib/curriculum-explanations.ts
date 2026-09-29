const EXPLANATIONS: Record<string, string> = {
  "meaning and uses of computers": "A computer accepts data, follows instructions, and produces information. People use computers to communicate, create documents, keep records, learn, and solve problems.",
  "types of computers": "Computers come in forms such as desktops, laptops, tablets, phones, and servers. Their size and design differ, but each combines hardware and software to process information.",
  "computer hardware and software": "Hardware is the physical equipment you can touch. Software is the set of programs and instructions that tells the equipment what work to perform.",
  "input, output, and storage devices": "Input devices send data to a computer, output devices present results, and storage devices keep files. A keyboard, screen, and drive are common examples.",
  "computer safety": "Computer safety combines careful handling, secure accounts, reliable backups, and healthy working habits to protect people, equipment, and information.",
  "windows": "Windows is an operating system. It manages files, applications, devices, and the desktop that people use to work with a computer.",
  "file management": "File management means naming, organizing, saving, finding, copying, and backing up digital files so they stay useful and recoverable.",
  "word": "Microsoft Word is a word processor for creating and revising documents such as letters, reports, forms, and learning materials.",
  "excel": "Microsoft Excel organizes information in rows and columns. Formulas calculate results from cell values, while charts help people notice patterns.",
  "powerpoint": "Microsoft PowerPoint arranges ideas into a sequence of visual slides. A clear presentation supports a speaker instead of asking slides to carry every detail.",
  "internet": "The internet is a global network that connects devices and services. The web is one part of it, accessed through browsers using URLs.",
  "graphic design": "Graphic design uses layout, type, imagery, and color to communicate a message clearly to a particular audience.",
  "programming": "Programming expresses instructions in a language a computer can run. A program combines data, decisions, and repeated steps to produce a result.",
  "html": "HTML describes the structure and meaning of web content, such as headings, paragraphs, links, images, and forms.",
  "css": "CSS controls how web content looks and adapts, including layout, color, typography, spacing, and responsive behavior.",
  "javascript": "JavaScript adds behavior to web pages and applications, from responding to user actions to retrieving and updating data.",
  "ai": "Artificial intelligence describes computer systems built to perform tasks associated with human reasoning, perception, language, or decision support.",
  "cybersecurity": "Cybersecurity reduces the chance that accounts, devices, and information will be accessed, changed, lost, or disrupted without permission.",
  "cloud": "Cloud services let people use computing, storage, and software through a network instead of managing every server and device themselves.",
  "email": "Email sends messages and files between accounts. Good email practice checks the recipient, protects personal information, and treats unexpected links cautiously.",
  "artificial intelligence": "Artificial intelligence describes systems that use data and computation to perform tasks such as classifying, recommending, predicting, or generating content.",
  "product discovery": "Product discovery identifies a real user need, checks who experiences it, and gathers evidence before a team commits to building a solution.",
  "user research": "User research studies people’s goals and constraints through ethical interviews, observation, and usability sessions rather than guesses.",
  "design system": "A design system is a shared set of interface rules and reusable components that helps a product stay consistent and accessible.",
  "accessibility": "Accessibility makes digital products usable by people with different abilities, devices, input methods, and support technologies.",
  "api": "An API is a defined way for software systems to request data or actions from one another, including rules for inputs and responses.",
  "database": "A database stores and retrieves organized information. Its structure and rules help applications find records and keep related data consistent.",
  "authentication": "Authentication checks which account a person controls, usually through a credential and a protected session.",
  "authorization": "Authorization decides what an authenticated person may do. The server must check permissions for every protected action.",
  "testing": "Software testing checks whether a product behaves as intended, including its normal path, invalid input, and failure recovery.",
  "deployment": "Deployment releases a reviewed version of software into an environment where people can use it.",
  "monitoring": "Monitoring collects signals about a running product so its team can see errors, performance changes, and user outcomes.",
};

export function explainTopic(topic: string, context: string) {
  const key = topic.trim().toLowerCase();
  const exact = EXPLANATIONS[key];
  if (exact) return exact;
  const match = Object.entries(EXPLANATIONS).find(([term]) => key.includes(term) || term.includes(key));
  if (match) return match[1];
  return `${topic} is a practical part of ${context.toLowerCase()}. Learn the key terms and tools, follow a small example, then apply the idea to a real task and check that the result is clear and reliable.`;
}

export function topicSubtopics(topic: string, context: string, description: string) {
  return [
    { title: "Understand the idea", detail: `Start with the meaning and purpose of ${topic}. ${description}` },
    { title: "Practice the steps", detail: `Work through a guided example of ${topic} in ${context.toLowerCase()}. Identify each step and explain why it is useful.` },
    { title: "Apply it in context", detail: `Use ${topic} in a small practical task. Check the outcome, notice any limitations, and explain what you would improve next.` },
  ];
}

🎤 MockMate AI — Voice-Based Interview Simulator

MockMate AI is an AI-powered platform designed to help candidates overcome interview anxiety and build confidence through realistic, real-time voice-based interview simulations. By leveraging the power of Generative AI, MockMate provides a safe, judgment-free environment for users to sharpen their communication and technical skills.

🎯 Problem Statement

Many students struggle in interviews not due to a lack of knowledge, but because of:

Lack of Practice: Absence of realistic, interactive interview environments.

No Personalized Feedback: Inability to identify specific communication or technical gaps.

Low Confidence: High anxiety levels during real-time questioning.

Static Platforms: Most current solutions are non-interactive or rely on pre-recorded content.

💡 The Solution

MockMate AI provides a voice-based AI interview experience where users can:

Practice in a judgment-free, simulated environment.

Interact with an AI interviewer that adapts its questions in real-time.

Receive data-driven evaluations and actionable feedback.

🔥 Key Features

🎤 Voice-Based Interaction

Real-time Interaction: Uses the Web Speech API for seamless voice-to-text and text-to-voice.

Natural Conversation: Mimics the flow of a real human interview.

🤖 Adaptive AI Interviewer

Dynamic Questioning: Questions evolve based on the candidate's previous responses.

Tailored Modes: - HR Interview: Evaluates soft skills, confidence, and behavioral traits.

Resume-Based: Scans projects, skills, and experience to ask deep-dive technical questions.

📊 Smart Evaluation & Reports

Multi-parameter Scoring: Detailed scores across communication, technical clarity, and more.

Voice Analysis: Detects hesitation, filler words (e.g., "um", "uh"), and estimates confidence levels.

Detailed AI Reports: Identifies strengths, weaknesses, and specific improvement suggestions.

📄 ATS & Resume Analysis

Resume Score: Evaluates resume quality out of 100.

Skill Gap Detection: Recommends missing skills needed for specific roles.

🏗️ System Architecture

graph TD
    User((User)) -->|Voice/Text| Frontend[React + Tailwind]
    Frontend -->|Web Speech API| VoiceEngine[Speech Processing]
    VoiceEngine -->|Transcribed Text| Backend[Node.js + Express]
    Backend -->|Context & History| AI[Gemini API Engine]
    AI -->|Generated Question/Analysis| Backend
    Backend -->|Final Feedback| Dashboard[User Dashboard]


🔄 Workflow

Selection: Choose interview type (HR or Resume-Based).

Upload (Optional): Upload a resume for personalized technical questions.

Simulation: AI asks questions via voice/text; user responds via microphone.

Processing: Speech is converted to text and analyzed by the Gemini AI.

Adaptation: The AI adjusts following questions based on the user's depth of knowledge.

Report: A comprehensive performance report is generated with scores and feedback.

⚙️ Tech Stack

Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js

AI Engine: Google Gemini API

Voice Processing: Web Speech API

Styling: Tailwind CSS

📊 Evaluation Parameters

HR Interview

Resume-Based Interview

Communication Skills

Technical Knowledge

Answer Framing

Project Understanding

Confidence Level

Problem Solving

Behavioral Traits

Implementation Clarity

Professionalism

Skill Relevance

Adaptability

Explanation Depth

🚀 Future Scope

Company-Specific Mocks: Simulations tailored for specific company cultures (e.g., Google, Amazon).

Video Analysis: Analyzing facial expressions and body language via webcam.

AI Career Coach: personalized learning roadmaps based on interview performance.

Multi-language Support: Support for interviews in various regional and international languages.

🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

📄 License

Distributed under the MIT License. See LICENSE for more information.

Created with ❤️ by the MockMate AI Team.

import React from 'react';
import { convertObjectToUnicode } from '../lib/unicodeConverter';

interface HTMLWorksheetTemplateProps {
    resourceData: any;
    generatedContent?: any;
}

export const HTMLWorksheetTemplate: React.FC<HTMLWorksheetTemplateProps> = ({
    resourceData,
    generatedContent,
}) => {
    const currentDate = new Date().toLocaleDateString();

    const content = generatedContent ? convertObjectToUnicode({ ...generatedContent }) : {
        worksheetTitle: `${resourceData.subject} - ${resourceData.topic}`,
        instructions: "Answer all five questions below. Show your reasoning and support your answers with evidence or working steps.",
        question1: `Define a key term related to ${resourceData.topic} in ${resourceData.subject}.`,
        question2: `Provide a worked example or calculation that illustrates ${resourceData.topic}.`,
        question3: `Analyze a short scenario or source and explain how it relates to ${resourceData.topic}.`,
        question4: `Create your own question about ${resourceData.topic} and solve it.`,
        question5: `Reflect: How does ${resourceData.topic} connect to what you've previously learned in ${resourceData.subject}?`,
        answer1: "Student definitions will vary.",
        answer2: "Work will vary based on the example chosen.",
        answer3: "Analysis will vary; should reference specific details.",
        answer4: "Student-created question and solution will vary.",
        answer5: "Reflections will vary."
    };

    const styles = {
        container: {
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12pt',
            color: '#000000',
            padding: '0',
        },
        page: {
            width: '210mm',
            minHeight: '297mm',
            padding: '40px',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box' as const,
            position: 'relative' as const,
            pageBreakAfter: 'always' as const,
        },
        studentInfo: {
            position: 'absolute' as const,
            top: '40px',
            right: '40px',
            padding: '10px',
            width: 'auto',
            maxWidth: '40%',
        },
        studentInfoRow: {
            display: 'flex',
            marginBottom: '8px',
            alignItems: 'center',
        },
        studentInfoLabel: {
            fontSize: '10pt',
            fontWeight: 'bold' as const,
            width: '60px',
        },
        studentInfoLine: {
            width: '150px',
            borderBottom: '1px solid #000000',
            marginLeft: '8px',
            height: '20px',
        },
        header: {
            position: 'absolute' as const,
            top: '120px',
            left: '40px',
            right: '40px',
            marginBottom: '30px',
            paddingBottom: '20px',
        },
        title: {
            fontSize: '18pt',
            fontWeight: 'bold' as const,
            marginBottom: '10px',
            textAlign: 'left' as const,
            color: '#000000',
        },
        content: {
            marginTop: '160px',
        },
        section: {
            marginBottom: '20px',
        },
        sectionTitle: {
            fontSize: '16pt',
            fontWeight: 'bold' as const,
            marginBottom: '10px',
            color: '#333333',
        },
        instructionsText: {
            fontSize: '12pt',
            marginBottom: '15px',
            lineHeight: '1.5',
        },
        question: {
            marginBottom: '25px',
            paddingLeft: '10px',
        },
        questionRow: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            marginBottom: '8px',
        },
        questionNumber: {
            width: '20px',
            textAlign: 'right' as const,
            fontWeight: 'bold' as const,
            flexShrink: 0,
        },
        questionText: {
            fontSize: '12pt',
            flex: 1,
            lineHeight: '1.5',
        },
        answerSpace: {
            borderBottom: '1px solid #cccccc',
            height: '60px',
            marginTop: '5px',
            marginLeft: '26px',
        },
        answerLabel: {
            fontWeight: 'bold' as const,
            marginRight: '5px',
        },
        answerText: {
            fontSize: '12pt',
            marginTop: '5px',
            marginLeft: '26px',
            lineHeight: '1.5',
        },
        footer: {
            position: 'absolute' as const,
            bottom: '40px',
            left: '40px',
            right: '40px',
            fontSize: '9pt',
            color: '#666666',
            borderTop: '1px solid #cccccc',
            paddingTop: '10px',
        },
        footerText: {
            fontSize: '9pt',
            color: '#666666',
        },
    };

    return (
        <div id="worksheet-content" style={styles.container}>
            {/* First Page - Questions */}
            <div style={styles.page} data-page="1">
                {/* Student Information Section */}
                <div style={styles.studentInfo}>
                    <div style={styles.studentInfoRow}>
                        <span style={styles.studentInfoLabel}>Name:</span>
                        <span style={styles.studentInfoLine}></span>
                    </div>
                    <div style={styles.studentInfoRow}>
                        <span style={styles.studentInfoLabel}>Date:</span>
                        <span style={styles.studentInfoLine}></span>
                    </div>
                    <div style={styles.studentInfoRow}>
                        <span style={styles.studentInfoLabel}>Period:</span>
                        <span style={styles.studentInfoLine}></span>
                    </div>
                </div>

                <div style={styles.header}>
                    <h1 style={styles.title}>
                        {content.worksheetTitle || `${resourceData.subject} - ${resourceData.topic}`}
                    </h1>
                </div>

                <div style={styles.content}>
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Instructions</h2>
                        <p style={styles.instructionsText}>
                            {content.instructions || "Please complete all questions below. Show your work where applicable."}
                        </p>
                    </div>

                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Questions</h2>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <div key={`question-${num}`} style={styles.question}>
                                <div style={styles.questionRow}>
                                    <span style={styles.questionNumber}>{num}.</span>
                                    <span style={styles.questionText}>
                                        {content[`question${num}`] || `Question ${num}`}
                                    </span>
                                </div>
                                <div style={styles.answerSpace} />
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.footer}>
                    <span style={styles.footerText}>
                        Made possible by Avalern Teacher Pages • Generated on {currentDate}
                    </span>
                </div>
            </div>

            {generatedContent && (
                <div style={styles.page} data-page="2">
                    <div style={{ ...styles.content, marginTop: '40px' }}>
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Answers</h2>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <div key={`answer-${num}`} style={styles.question}>
                                    <div style={styles.questionRow}>
                                        <span style={styles.questionNumber}>{num}.</span>
                                        <span style={styles.questionText}>
                                            {content[`question${num}`] || `Question ${num}`}
                                        </span>
                                    </div>
                                    <div style={styles.answerText}>
                                        <span style={styles.answerLabel}>Answer:</span>
                                        {content[`answer${num}`] || "Answer not provided."}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={styles.footer}>
                        <span style={styles.footerText}>
                            Made possible by Avalern Teacher Pages • Answer Key • Generated on {currentDate}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HTMLWorksheetTemplate;


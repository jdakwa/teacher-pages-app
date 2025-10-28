import { Document, Page, StyleSheet, Text, View, Image } from '@react-pdf/renderer';
import { convertToLatex } from '../components/MathExpression';

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontSize: 12,
    fontFamily: 'Helvetica'
  },
  studentInfo: {
    position: 'absolute',
    top: 40,
    right: 40,
    padding: 10,
    width: 'auto',
    maxWidth: '40%'
  },
  studentInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center'
  },
  studentInfoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 45
  },
  studentInfoLine: {
    width: 100,
    borderBottom: '1px solid #000000',
    marginLeft: 8,
    height: 12
  },
  header: {
    position: 'absolute',
    top: 120,
    left: 40,
    right: 40,
    marginBottom: 30,
    paddingBottom: 20
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    color: '#000000',
    flexWrap: 'wrap'
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20
  },
  content: {
    marginTop: 120
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333'
  },
  question: {
    marginBottom: 15,
    paddingLeft: 10
  },
  questionText: {
    fontSize: 12,
    marginBottom: 5
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6
  },
  questionNumber: {
    width: 14,
    textAlign: 'right',
    fontWeight: 'bold'
  },
  answerLabel: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  answerSpace: {
    borderBottom: '1px solid #000000',
    height: 20,
    marginTop: 5
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
    borderTop: '1px solid #e0e0e0',
    paddingTop: 10
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerLogo: {
    width: 14,
    height: 14,
    marginRight: 6
  }
});

// Helper function to process text for PDF rendering
const processTextForPDF = (text: any): string => {
  if (!text) return '';
  
  // Ensure text is a string
  const textStr = String(text);
  
  // Convert common mathematical notation to readable text for PDF
  return textStr
    // First handle chemical formulas (before other replacements)
    // Convert chemical formulas with subscripts: H2O -> H₂O, CO2 -> CO₂
    .replace(/([A-Z][a-z]?)(\d+)([A-Z][a-z]?)/g, (match, element1, number, element2) => {
      const subscriptMap: { [key: string]: string } = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
        '6': '₆', '7': '₇', '8': '₈', '9': '₉'
      };
      return element1 + (subscriptMap[number] || number) + element2;
    })
    // Handle simple chemical formulas: H2O -> H₂O, CO2 -> CO₂
    .replace(/([A-Z][a-z]?)(\d+)/g, (match, element, number) => {
      const subscriptMap: { [key: string]: string } = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
        '6': '₆', '7': '₇', '8': '₈', '9': '₉'
      };
      return element + (subscriptMap[number] || number);
    })
    // Convert ions with charges: H^+ -> H⁺, SO4^2- -> SO₄²⁻
    .replace(/([A-Z][a-z]?)\^(\d+)\+/g, '$1$2⁺')
    .replace(/([A-Z][a-z]?)\^(\d+)\-/g, '$1$2⁻')
    .replace(/([A-Z][a-z]?)\+/g, '$1⁺')
    .replace(/([A-Z][a-z]?)\-/g, '$1⁻')
    // Convert superscripts: x^2 -> x², x^3 -> x³, etc.
    .replace(/(\w+)\^2/g, '$1²')
    .replace(/(\w+)\^3/g, '$1³')
    .replace(/(\w+)\^4/g, '$1⁴')
    .replace(/(\w+)\^5/g, '$1⁵')
    .replace(/(\w+)\^6/g, '$1⁶')
    .replace(/(\w+)\^7/g, '$1⁷')
    .replace(/(\w+)\^8/g, '$1⁸')
    .replace(/(\w+)\^9/g, '$1⁹')
    .replace(/(\w+)\^0/g, '$1⁰')
    .replace(/(\w+)\^1/g, '$1¹')
    // Convert subscripts: H_2O -> H₂O, CO_2 -> CO₂
    .replace(/(\w+)_2/g, '$1₂')
    .replace(/(\w+)_3/g, '$1₃')
    .replace(/(\w+)_4/g, '$1₄')
    .replace(/(\w+)_5/g, '$1₅')
    .replace(/(\w+)_6/g, '$1₆')
    .replace(/(\w+)_7/g, '$1₇')
    .replace(/(\w+)_8/g, '$1₈')
    .replace(/(\w+)_9/g, '$1₉')
    .replace(/(\w+)_0/g, '$1₀')
    .replace(/(\w+)_1/g, '$1₁')
    // Convert fractions: 1/2 -> ½, 1/4 -> ¼, 3/4 -> ¾, etc.
    .replace(/\b1\/2\b/g, '½')
    .replace(/\b1\/4\b/g, '¼')
    .replace(/\b3\/4\b/g, '¾')
    .replace(/\b1\/3\b/g, '⅓')
    .replace(/\b2\/3\b/g, '⅔')
    .replace(/\b1\/5\b/g, '⅕')
    .replace(/\b2\/5\b/g, '⅖')
    .replace(/\b3\/5\b/g, '⅗')
    .replace(/\b4\/5\b/g, '⅘')
    .replace(/\b1\/6\b/g, '⅙')
    .replace(/\b5\/6\b/g, '⅚')
    .replace(/\b1\/8\b/g, '⅛')
    .replace(/\b3\/8\b/g, '⅜')
    .replace(/\b5\/8\b/g, '⅝')
    .replace(/\b7\/8\b/g, '⅞')
    // Handle complex fractions with proper formatting: (2x² + 3)/(x - 1) -> (2x² + 3) over (x - 1)
    .replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '($1) over ($2)')
    // Handle simple fractions with proper formatting: 5/7 -> 5 over 7
    .replace(/(\d+)\/(\d+)/g, '$1 over $2')
    // Convert chemical equations: -> -> →, <-> -> ↔
    .replace(/->/g, '→')
    .replace(/<->/g, '↔')
    // Convert Greek letters to Unicode
    .replace(/\balpha\b/g, 'α')
    .replace(/\bbeta\b/g, 'β')
    .replace(/\bgamma\b/g, 'γ')
    .replace(/\bdelta\b/g, 'δ')
    .replace(/\bepsilon\b/g, 'ε')
    .replace(/\btheta\b/g, 'θ')
    .replace(/\blambda\b/g, 'λ')
    .replace(/\bmu\b/g, 'μ')
    .replace(/\bpi\b/g, 'π')
    .replace(/\bsigma\b/g, 'σ')
    .replace(/\btau\b/g, 'τ')
    .replace(/\bphi\b/g, 'φ')
    .replace(/\bomega\b/g, 'ω')
    // Convert square roots: sqrt(x) -> √x
    .replace(/sqrt\(([^)]+)\)/g, '√$1');
};

// PDF Document Component
const WorksheetTemplate = ({ 
  resourceData, 
  generatedContent 
}: { 
  resourceData: any;
  generatedContent?: any;
}) => {
  const currentDate = new Date().toLocaleDateString();
  
  // Use AI-generated content if available, otherwise fall back to subject/topic-aware content
  const content = generatedContent || {
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
  
  return (
    <Document>
      {/* First Page - Worksheet */}
      <Page size="A4" style={pdfStyles.page}>
        {/* Student Information Section */}
        <View style={pdfStyles.studentInfo}>
          <View style={pdfStyles.studentInfoRow}>
            <Text style={pdfStyles.studentInfoLabel}>Name:</Text>
            <View style={pdfStyles.studentInfoLine} />
          </View>
          <View style={pdfStyles.studentInfoRow}>
            <Text style={pdfStyles.studentInfoLabel}>Date:</Text>
            <View style={pdfStyles.studentInfoLine} />
          </View>
          <View style={pdfStyles.studentInfoRow}>
            <Text style={pdfStyles.studentInfoLabel}>Period:</Text>
            <View style={pdfStyles.studentInfoLine} />
          </View>
        </View>

        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>
            {processTextForPDF(content.worksheetTitle || `${resourceData.subject} - ${resourceData.topic}`)}
          </Text>
        </View>

        {/* Content */}
        <View style={pdfStyles.content}>
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Instructions</Text>
            <Text style={pdfStyles.questionText}>
              {processTextForPDF(content.instructions || "Please complete all questions below. Show your work where applicable.")}
            </Text>
          </View>

          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Questions</Text>
            {/* AI-generated questions */}
            <>
              <View style={pdfStyles.question}>
                <View style={pdfStyles.questionRow}>
                  <Text style={pdfStyles.questionNumber}>1.</Text>
                  <Text style={pdfStyles.questionText}>{processTextForPDF(content.question1 || `Define a key term related to ${resourceData.topic} in ${resourceData.subject}.`)}</Text>
                </View>
                <View style={pdfStyles.answerSpace} />
              </View>
              <View style={pdfStyles.question}>
                <View style={pdfStyles.questionRow}>
                  <Text style={pdfStyles.questionNumber}>2.</Text>
                  <Text style={pdfStyles.questionText}>{processTextForPDF(content.question2 || `Provide a worked example or calculation that illustrates ${resourceData.topic}.`)}</Text>
                </View>
                <View style={pdfStyles.answerSpace} />
              </View>
              <View style={pdfStyles.question}>
                <View style={pdfStyles.questionRow}>
                  <Text style={pdfStyles.questionNumber}>3.</Text>
                  <Text style={pdfStyles.questionText}>{processTextForPDF(content.question3 || `Analyze a short scenario or source and explain how it relates to ${resourceData.topic}.`)}</Text>
                </View>
                <View style={pdfStyles.answerSpace} />
              </View>
              <View style={pdfStyles.question}>
                <View style={pdfStyles.questionRow}>
                  <Text style={pdfStyles.questionNumber}>4.</Text>
                  <Text style={pdfStyles.questionText}>{processTextForPDF(content.question4 || `Create your own question about ${resourceData.topic} and solve it.`)}</Text>
                </View>
                <View style={pdfStyles.answerSpace} />
              </View>
              <View style={pdfStyles.question}>
                <View style={pdfStyles.questionRow}>
                  <Text style={pdfStyles.questionNumber}>5.</Text>
                  <Text style={pdfStyles.questionText}>{processTextForPDF(content.question5 || `Reflect: How does ${resourceData.topic} connect to what you've previously learned in ${resourceData.subject}?`)}</Text>
                </View>
                <View style={pdfStyles.answerSpace} />
              </View>
            </>
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <View style={pdfStyles.footerRow}>
            <Image style={pdfStyles.footerLogo} src="/logos/Regular_Logo.png" />
            <Text>Made possible by Avalern Teacher Pages • Generated on {currentDate}</Text>
          </View>
        </View>
      </Page>

      {/* Second Page - Answer Key (only if AI content is available) */}
      {generatedContent && (
        <Page size="A4" style={pdfStyles.page}>

          {/* Answer Key Content */}
          <View style={[pdfStyles.content, { marginTop: 0 }]}>
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>Answers</Text>
              <View style={pdfStyles.question}>
                <View style={pdfStyles.questionRow}>
                  <Text style={pdfStyles.questionNumber}>1.</Text>
                  <Text style={pdfStyles.questionText}>{processTextForPDF(content.question1 || `Define a key term related to ${resourceData.topic} in ${resourceData.subject}.`)}</Text>
                </View>
                <Text style={pdfStyles.questionText}>   <Text style={pdfStyles.answerLabel}>Answer:</Text> {processTextForPDF(content.answer1 || "Student definitions will vary.")}</Text>
              </View>
              <View style={pdfStyles.question}>
                <View style={pdfStyles.questionRow}>
                  <Text style={pdfStyles.questionNumber}>2.</Text>
                  <Text style={pdfStyles.questionText}>{processTextForPDF(content.question2 || `Provide a worked example or calculation that illustrates ${resourceData.topic}.`)}</Text>
                </View>
                <Text style={pdfStyles.questionText}>   <Text style={pdfStyles.answerLabel}>Answer:</Text> {processTextForPDF(content.answer2 || "Work will vary based on the example chosen.")}</Text>
              </View>
              <View style={pdfStyles.question}>
                <View style={pdfStyles.questionRow}>
                  <Text style={pdfStyles.questionNumber}>3.</Text>
                  <Text style={pdfStyles.questionText}>{processTextForPDF(content.question3 || `Analyze a short scenario or source and explain how it relates to ${resourceData.topic}.`)}</Text>
                </View>
                <Text style={pdfStyles.questionText}>   <Text style={pdfStyles.answerLabel}>Answer:</Text> {processTextForPDF(content.answer3 || "Analysis will vary; should reference specific details.")}</Text>
              </View>
              <View style={pdfStyles.question}>
                <View style={pdfStyles.questionRow}>
                  <Text style={pdfStyles.questionNumber}>4.</Text>
                  <Text style={pdfStyles.questionText}>{processTextForPDF(content.question4 || `Create your own question about ${resourceData.topic} and solve it.`)}</Text>
                </View>
                <Text style={pdfStyles.questionText}>   <Text style={pdfStyles.answerLabel}>Answer:</Text> {processTextForPDF(content.answer4 || "Student-created question and solution will vary.")}</Text>
              </View>
              <View style={pdfStyles.question}>
                <View style={pdfStyles.questionRow}>
                  <Text style={pdfStyles.questionNumber}>5.</Text>
                  <Text style={pdfStyles.questionText}>{processTextForPDF(content.question5 || `Reflect: How does ${resourceData.topic} connect to what you've previously learned in ${resourceData.subject}?`)}</Text>
                </View>
                <Text style={pdfStyles.questionText}>   <Text style={pdfStyles.answerLabel}>Answer:</Text> {processTextForPDF(content.answer5 || "Reflections will vary.")}</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={pdfStyles.footer}>
            <View style={pdfStyles.footerRow}>
              <Image style={pdfStyles.footerLogo} src="/logos/Regular_Logo.png" />
              <Text>Made possible by Avalern Teacher Pages • Answer Key • Generated on {currentDate}</Text>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default WorksheetTemplate;
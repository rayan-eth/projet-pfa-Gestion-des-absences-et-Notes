const Anthropic = require('@anthropic-ai/sdk');
const db = require('../config/database');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'mock-api-key', 
});

const generateStudentSynthesis = async (req, res) => {
    const { student_id } = req.params;

    try {
        // Fetch student data, grades, absences to pass to the AI
        db.get(`SELECT * FROM users WHERE id = ? AND role = 'STUDENT'`, [student_id], (err, student) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err.message });
            if (!student) return res.status(404).json({ message: 'Student not found' });

            db.all(`SELECT g.*, s.name as subject_name FROM grades g JOIN subjects s ON g.subject_id = s.id WHERE g.student_id = ?`, [student_id], async (err, grades) => {
                if (err) return res.status(500).json({ message: 'Database error', error: err.message });
                
                db.all(`SELECT * FROM absences WHERE student_id = ?`, [student_id], async (err, absences) => {
                    if (err) return res.status(500).json({ message: 'Database error', error: err.message });

                    const totalAbsences = absences.length;
                    const justifiedAbsences = absences.filter(a => a.is_justified).length;
                    
                    const gradesSummary = grades.map(g => `${g.subject_name}: ${g.score}`).join('\n');
                    
                    const prompt = `
                    You are an educational AI assistant for a School Tracking System.
                    Please write a brief synthesis (2-3 paragraphs) of the student's performance based on the following data:
                    
                    Student Name: ${student.name}
                    Total Absences: ${totalAbsences} (Justified: ${justifiedAbsences})
                    
                    Grades:
                    ${gradesSummary || 'No grades recorded yet.'}
                    
                    Provide an encouraging but objective assessment of their performance, highlighting strengths and areas for improvement. Be professional and write in French.
                    `;

                    if (process.env.ANTHROPIC_API_KEY === 'mock-api-key' || !process.env.ANTHROPIC_API_KEY) {
                        let mockSynthesis = `Analyse générée localement pour ${student.name} :\n\n`;
                        
                        // Analyse des absences
                        if (totalAbsences === 0) {
                            mockSynthesis += `L'assiduité est parfaite, aucune absence n'a été enregistrée. C'est un excellent point pour la réussite scolaire. `;
                        } else if (totalAbsences <= 3) {
                            mockSynthesis += `Quelques absences (${totalAbsences}) ont été notées, mais l'assiduité globale reste correcte. `;
                        } else {
                            mockSynthesis += `Attention au taux d'absentéisme qui commence à être élevé avec ${totalAbsences} absences (dont ${justifiedAbsences} justifiées). Une meilleure régularité est attendue. `;
                        }

                        // Analyse des notes
                        if (grades.length === 0) {
                            mockSynthesis += `\n\nAucune note n'a encore été saisie, il n'est donc pas possible d'évaluer le niveau académique pour le moment.`;
                        } else {
                            const average = grades.reduce((acc, curr) => acc + parseFloat(curr.score), 0) / grades.length;
                            mockSynthesis += `\n\nConcernant les résultats scolaires, la moyenne calculée à partir des notes actuelles est de ${average.toFixed(2)}/20. `;
                            
                            if (average >= 16) {
                                mockSynthesis += `C'est un excellent niveau ! Le travail est sérieux, rigoureux et les résultats sont très satisfaisants. Félicitations, continuez dans cette voie.`;
                            } else if (average >= 14) {
                                mockSynthesis += `Le niveau global est très bon. Le travail porte ses fruits.`;
                            } else if (average >= 12) {
                                mockSynthesis += `Les résultats sont satisfaisants et réguliers. Avec un peu plus d'efforts, le niveau pourrait devenir excellent.`;
                            } else if (average >= 10) {
                                mockSynthesis += `Les résultats sont justes. Il faut s'investir davantage et redoubler d'efforts pour consolider les acquis.`;
                            } else {
                                mockSynthesis += `Le niveau actuel est malheureusement insuffisant. Un travail plus régulier, méthodique et rigoureux est nécessaire pour progresser au prochain trimestre.`;
                            }
                        }

                        return res.json({ synthesis: mockSynthesis });
                    }

                    try {
                        const msg = await anthropic.messages.create({
                            model: "claude-3-opus-20240229",
                            max_tokens: 1000,
                            temperature: 0.7,
                            system: "You are a professional educational AI assistant.",
                            messages: [
                                {"role": "user", "content": prompt}
                            ]
                        });

                        res.json({ synthesis: msg.content[0].text });
                    } catch (apiError) {
                        res.status(500).json({ message: 'AI API Error', error: apiError.message });
                    }
                });
            });
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { generateStudentSynthesis };

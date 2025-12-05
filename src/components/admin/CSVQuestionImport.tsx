import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function CSVQuestionImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map((line) => {
      const values = line.split(',');
      const obj: any = {};

      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });

      return obj;
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const questions = parseCSV(text);

      const importResult: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (const question of questions) {
        try {
          const options = [
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
          ].filter(Boolean);

          if (!question.course_code || !question.question_text || !question.correct_answer) {
            throw new Error('Missing required fields');
          }

          const { error } = await supabase.from('quiz_questions').insert({
            course_code: question.course_code,
            segment_number: parseInt(question.segment_number) || 1,
            question_text: question.question_text,
            question_type: question.question_type || 'multiple_choice',
            options: options,
            correct_answer: question.correct_answer,
            explanation: question.explanation || null,
            difficulty: question.difficulty || 'medium',
            topic: question.topic || null,
          });

          if (error) throw error;

          importResult.success++;
        } catch (err: any) {
          importResult.failed++;
          importResult.errors.push(`Row ${questions.indexOf(question) + 2}: ${err.message}`);
        }
      }

      setResult(importResult);
    } catch (err: any) {
      alert(`Failed to import: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500/10 p-3 rounded-full">
          <FileText className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Import Questions from CSV
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload a CSV file to bulk import quiz questions
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            id="csv-upload"
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="text-gray-400" size={40} />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">CSV file with questions</p>
          </label>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            CSV Format Requirements:
          </p>
          <ul className="list-disc list-inside text-blue-800 dark:text-blue-300 space-y-1">
            <li>Headers: course_code, segment_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, topic</li>
            <li>Required fields: course_code, question_text, correct_answer</li>
            <li>Difficulty values: easy, medium, hard</li>
            <li>Question type: multiple_choice or true_false</li>
          </ul>
        </div>

        {result && (
          <div
            className={`rounded-lg p-4 ${
              result.failed === 0
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.failed === 0 ? (
                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
              ) : (
                <AlertCircle className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" size={20} />
              )}
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    result.failed === 0
                      ? 'text-green-900 dark:text-green-200'
                      : 'text-orange-900 dark:text-orange-200'
                  }`}
                >
                  Import Complete
                </p>
                <p
                  className={`text-sm mt-1 ${
                    result.failed === 0
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-orange-800 dark:text-orange-300'
                  }`}
                >
                  Successfully imported: {result.success} questions
                  {result.failed > 0 && ` | Failed: ${result.failed}`}
                </p>
                {result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                      Errors:
                    </p>
                    <ul className="text-xs text-orange-800 dark:text-orange-300 mt-1 space-y-1 max-h-32 overflow-y-auto">
                      {result.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {result.errors.length > 10 && (
                        <li>... and {result.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!file || importing}
          variant="primary"
          className="w-full"
        >
          {importing ? 'Importing...' : 'Import Questions'}
        </Button>
      </div>
    </Card>
  );
}

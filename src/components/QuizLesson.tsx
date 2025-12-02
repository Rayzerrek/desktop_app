import { useState } from 'react'
import { Lesson, Course, QuizLesson as QuizLessonType } from '../types/lesson'
import { progressService } from '../services/ProgressService'
import LessonSuccessModal from './LessonSuccessModal'

interface QuizLessonProps {
  lesson: Lesson
  course: Course | null
  onNextLesson?: (nextLessonId: string) => void
  lessonId?: string
}

export default function QuizLesson({
  lesson,
  course,
  onNextLesson,
  lessonId = '',
}: QuizLessonProps) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const quizContent = lesson.content as QuizLessonType

  const handleSelectOption = (index: number) => {
    if (showFeedback) return

    setSelectedOptionIndex(index)
    const selectedOption = quizContent.options[index]
    const correct = selectedOption.isCorrect

    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      const userId = localStorage.getItem('user_id')
      if (userId && lessonId) {
        progressService.markLessonCompleted(userId, lessonId).catch((error) =>
          console.error('Error saving progress:', error)
        )
      }

      setTimeout(() => {
        setShowSuccessModal(true)
      }, 500)
    }
  }

  const handleNextLesson = async () => {
    setShowSuccessModal(false)
    onNextLesson?.(lessonId)
  }

  const handleRetry = () => {
    setSelectedOptionIndex(null)
    setShowFeedback(false)
    setIsCorrect(false)
  }

  return (
    <>
      <LessonSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onNextLesson={handleNextLesson}
        xpReward={lesson.xp_reward}
        lessonTitle={lesson.title}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
              <span className="font-medium">{course?.title || 'Kurs'}</span>
              <span className="text-slate-400 dark:text-slate-500">›</span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                Lekcja {lesson.orderIndex}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-3">{lesson.description}</p>
          </div>

          {/* Main Quiz Card */}
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8"
          >
            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {quizContent.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {quizContent.options.map((option, index) => {
                  const isSelected = selectedOptionIndex === index
                  const isAnswered = showFeedback
                  const optionIsCorrect = option.isCorrect

                  let borderColor = 'border-slate-200 dark:border-slate-600'
                  let bgColor = 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                  let textColor = 'text-slate-900 dark:text-white'

                  if (isAnswered) {
                    if (isSelected) {
                      if (optionIsCorrect) {
                        borderColor = 'border-success'
                        bgColor = 'bg-success/10'
                        textColor = 'text-success'
                      } else {
                        borderColor = 'border-error'
                        bgColor = 'bg-error/10'
                        textColor = 'text-error'
                      }
                    } else if (optionIsCorrect) {
                      borderColor = 'border-success'
                      bgColor = 'bg-success/10'
                      textColor = 'text-success'
                    } else {
                      borderColor = 'border-slate-200 dark:border-slate-600'
                      bgColor = 'bg-slate-50 dark:bg-slate-800'
                      textColor = 'text-slate-400 dark:text-slate-500'
                    }
                  } else if (isSelected) {
                    borderColor = 'border-purple-400 dark:border-purple-500'
                    bgColor = 'bg-purple-50 dark:bg-purple-900/30'
                    textColor = 'text-purple-700 dark:text-purple-300'
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${borderColor} ${bgColor} ${textColor} ${
                        isAnswered ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mt-0.5 ${
                            isAnswered
                              ? optionIsCorrect
                                ? 'border-green-500 bg-green-500'
                                : isSelected
                                  ? 'border-red-500 bg-red-500'
                                  : 'border-slate-300 dark:border-slate-600'
                              : isSelected
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isAnswered && optionIsCorrect && (
                            <span className="text-white text-sm">✓</span>
                          )}
                          {isAnswered && isSelected && !optionIsCorrect && (
                            <span className="text-white text-sm">✗</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{option.text}</p>
                          {isAnswered &&
                            isSelected &&
                            option.explanation && (
                              <p className="text-sm mt-2 opacity-75">
                                {option.explanation}
                              </p>
                            )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Explanation */}
            {showFeedback && quizContent.explanation && (
              <div
                className={`mt-8 p-6 rounded-2xl border-l-4 ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200'
                    : 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-800 dark:text-amber-200'
                }`}
              >
                <p className="font-semibold mb-2">📚 Wyjaśnienie:</p>
                <p>{quizContent.explanation}</p>
              </div>
            )}

            {/* Feedback Messages */}
            {showFeedback && (
              <div className="mt-8 space-y-4">
                {isCorrect ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      🎉 Świetnie!
                    </h3>
                    <p className="text-green-600 dark:text-green-300">
                      Poprawnie odpowiedziałeś na pytanie!
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                      ❌ Nie do końca...
                    </h3>
                    <p className="text-red-600 dark:text-red-300 mb-4">
                      To nie była poprawna odpowiedź. Spróbuj jeszcze raz!
                    </p>
                    <button
                      onClick={handleRetry}
                      className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl"
                    >
                      Spróbuj ponownie
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* XP Reward */}
            {!showFeedback && (
              <div className="mt-8 flex items-center justify-between bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 shadow-lg">
                <span className="text-white font-semibold">
                  Nagroda za ukończenie
                </span>
                <span className="text-3xl font-bold text-white">
                  +{lesson.xp_reward} XP
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

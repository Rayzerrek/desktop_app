import { describe, it, expect } from 'vitest'
import {
  createExerciseContent,
  createTheoryContent,
  createQuizContent,
  createProjectContent,
} from './lessonHelpers'

describe('lessonHelpers', () => {
  describe('createExerciseContent', () => {
    it('creates exercise with all fields', () => {
      const result = createExerciseContent({
        instruction: 'Write a function',
        starterCode: 'function test() {}',
        solution: 'function test() { return true; }',
        hint: 'Use return',
        exampleCode: 'console.log(test());',
        exampleDescription: 'Example usage',
        expectedOutput: 'true',
      })

      expect(result.type).toBe('exercise')
      expect(result.instruction).toBe('Write a function')
      expect(result.starterCode).toBe('function test() {}')
      expect(result.solution).toBe('function test() { return true; }')
      expect(result.hint).toBe('Use return')
      expect(result.testCases).toHaveLength(1)
      expect(result.testCases?.[0].expectedOutput).toBe('true')
    })

    it('creates exercise without optional fields', () => {
      const result = createExerciseContent({
        instruction: 'Basic task',
        starterCode: 'let x;',
        solution: 'let x = 5;',
      })

      expect(result.type).toBe('exercise')
      expect(result.hint).toBeUndefined()
      expect(result.testCases).toBeUndefined()
    })
  })

  describe('createTheoryContent', () => {
    it('creates theory with multiple blocks', () => {
      const result = createTheoryContent([
        { type: 'text', content: 'Introduction' },
        { type: 'code', content: 'const x = 5;', language: 'javascript' },
        { type: 'tip', content: 'Remember this!' },
      ])

      expect(result.type).toBe('theory')
      expect(result.blocks).toHaveLength(3)
      expect(result.blocks[0].type).toBe('text')
      expect(result.blocks[1].type).toBe('code')
      expect(result.blocks[2].type).toBe('tip')
    })

    it('creates theory with empty blocks', () => {
      const result = createTheoryContent([])

      expect(result.type).toBe('theory')
      expect(result.blocks).toHaveLength(0)
    })
  })

  describe('createQuizContent', () => {
    it('creates quiz with all fields', () => {
      const result = createQuizContent({
        question: 'What is 2+2?',
        options: [
          { text: '3', isCorrect: false, explanation: 'Wrong' },
          { text: '4', isCorrect: true, explanation: 'Correct!' },
        ],
        explanation: 'Basic math',
      })

      expect(result.type).toBe('quiz')
      expect(result.question).toBe('What is 2+2?')
      expect(result.options).toHaveLength(2)
      expect(result.options[1].isCorrect).toBe(true)
      expect(result.explanation).toBe('Basic math')
    })

    it('creates quiz without explanation', () => {
      const result = createQuizContent({
        question: 'Test?',
        options: [{ text: 'Yes', isCorrect: true }],
      })

      expect(result.explanation).toBeUndefined()
    })
  })

  describe('createProjectContent', () => {
    it('creates project with all fields', () => {
      const result = createProjectContent({
        title: 'Calculator',
        description: 'Build a calculator',
        requirements: ['Add', 'Subtract'],
        starterCode: 'class Calc {}',
        hints: ['Use methods', 'Return numbers'],
      })

      expect(result.type).toBe('project')
      expect(result.title).toBe('Calculator')
      expect(result.requirements).toHaveLength(2)
      expect(result.hints).toHaveLength(2)
    })

    it('creates project without optional fields', () => {
      const result = createProjectContent({
        title: 'Simple Project',
        description: 'Build something',
        requirements: ['Requirement 1'],
      })

      expect(result.type).toBe('project')
      expect(result.starterCode).toBeUndefined()
      expect(result.hints).toBeUndefined()
    })
  })
})

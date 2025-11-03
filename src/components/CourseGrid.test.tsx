import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CourseGrid from './CourseGrid'
import '@testing-library/jest-dom/vitest'

describe('CourseGrid', () => {
  it('renders course cards and progress', () => {
    const courses = [
      {
        id: 'c1',
        title: 'Course One',
        description: 'Desc 1',
        difficulty: 'beginner',
        language: 'javascript',
        modules: [],
        color: '#4f46e5',
        isPublished: true,
      },
      {
        id: 'c2',
        title: 'Course Two',
        description: 'Desc 2',
        difficulty: 'intermediate',
        language: 'python',
        modules: [],
        color: '#0ea5e9',
        isPublished: true,
      },
    ]

    render(
      <CourseGrid
        courses={courses as any}
        onCourseSelect={() => {}}
        getCourseProgress={(c) => (c.id === 'c1' ? 20 : 75)}
      />
    )

    expect(screen.getByText('Course One')).toBeInTheDocument()
    expect(screen.getByText('Course Two')).toBeInTheDocument()

    // Check progress text present
    expect(screen.getByText('20% ukończono')).toBeInTheDocument()
    expect(screen.getByText('75% ukończono')).toBeInTheDocument()
  })
})

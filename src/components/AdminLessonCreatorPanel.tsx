export default function AdminLessonCreatorPanel() {
  return (
    <>
      <div className="flex flex-col gap-4 font-sans text-gray-700">
        <h2>Create new lesson</h2>
        <div className="bg-white p-4 rounded shadow">
          <label htmlFor="lesson-title">Title:</label>
          <input type="text" id="lesson-title" name="lesson-title" />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label htmlFor="lesson-description">Description:</label>
          <textarea id="lesson-description" name="lesson-description" />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label htmlFor="lesson-content">Content:</label>
          <textarea id="lesson-content" name="lesson-content" />
        </div>
        <button
          type="submit"
          className="bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => {}}
        >
          Create Lesson
        </button>
      </div>
    </>
  )
}

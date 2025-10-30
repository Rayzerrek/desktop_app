import { Course } from "../types/lesson"
export const countLessons = (course:Course):number => {
    return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}
export const getFileNameForLanguage = (language:string):string => {
    const mapping: Record<string, string> = {
        python: "main.py",
        javascript: "script.js",
        html: "index.html",
        css: "styles.css",
        typescript: "script.ts",
    }
    return mapping[language] || `code.${language}`;
}

export const getNextLessonId = (courses:Course[], lessonId:string):string | undefined => {
    for(const course of courses){
        for(const module of course.modules){
            const lessonIndex = module.lessons.findIndex(lesson => lesson.id === lessonId);
            if(lessonIndex !== -1){
                const nextLesson = module.lessons[lessonIndex + 1];
                if(nextLesson){
                    return nextLesson.id;
                }
            }
        }
    }
}

export const findCourseByLessonId = (courses:Course[], lessonId:string):Course | undefined => {
    for(const course of courses){
        for(const module of course.modules){
            const lesson = module.lessons.find(lesson => lesson.id === lessonId);
            if(lesson){
                return course;
            }
        }
    }
}

export const getAllLessonIds = (course: Course): string[] => {
    return course.modules.flatMap(module => 
        module.lessons.map(lesson => lesson.id)
    );
}
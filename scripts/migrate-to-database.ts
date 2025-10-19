import { invoke } from "@tauri-apps/api/core";
import { allCourses } from "../src/data/sampleLessons";

async function migrateToDatabase() {
  console.log("🚀 Starting migration to Supabase...\n");

  const token = localStorage.getItem("access_token");
  if (!token) {
    console.error("❌ No access token found. Please login as admin first.");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const course of allCourses) {
    try {
      console.log(`📚 Migrating course: ${course.title}`);

      const createdCourse:any = await invoke("create_course", {
        course: {
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          language: course.language,
          color: course.color,
          isPublished: course.isPublished,
          estimatedHours: course.estimatedHours,
          iconUrl: course.iconUrl,
        },
        accessToken: token,
      });

      console.log(`  ✅ Course created: ${createdCourse.id}`);

      for (const module of course.modules) {
        try {
          console.log(`  📦 Migrating module: ${module.title}`);

          const createdModule = await invoke("create_module", {
            module: {
              course_id: createdCourse.id,
              title: module.title,
              description: module.description,
              orderIndex: module.orderIndex,
              iconEmoji: module.iconEmoji,
            },
            accessToken: token,
          }) as { id: string | number };

          console.log(`    ✅ Module created: ${createdModule.id}`);

          for (const lesson of module.lessons) {
            try {
              console.log(`    📝 Migrating lesson: ${lesson.title}`);

              await invoke("create_lesson", {
                lesson: {
                  module_id: createdModule.id,
                  title: lesson.title,
                  description: lesson.description,
                  lessonType: lesson.lessonType,
                  content: lesson.content,
                  language: lesson.language,
                  xpReward: lesson.xp_reward,
                  orderIndex: lesson.orderIndex,
                  isLocked: lesson.isLocked || false,
                  estimatedMinutes: lesson.estimatedMinutes,
                },
                accessToken: token,
              });

              console.log(`      ✅ Lesson migrated`);
              successCount++;
            } catch (error) {
              console.error(`      ❌ Failed to migrate lesson:`, error);
              errorCount++;
            }
          }
        } catch (error) {
          console.error(`    ❌ Failed to migrate module:`, error);
          errorCount++;
        }
      }
    } catch (error) {
      console.error(`  ❌ Failed to migrate course:`, error);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Migration Summary:");
  console.log(`   ✅ Success: ${successCount} lessons`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log("=".repeat(50));

  if (errorCount === 0) {
    console.log("\n🎉 Migration completed successfully!");
  } else {
    console.log("\n⚠️ Migration completed with some errors.");
  }
}

// Run migration
migrateToDatabase().catch(console.error);

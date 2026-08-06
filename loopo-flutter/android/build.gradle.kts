allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

subprojects {
    val configureSubprojectAndroid = {
        if (plugins.hasPlugin("com.android.library")) {
            val android = extensions.findByName("android")
            if (android != null) {
                // 1. Force compileSdkVersion to 36 to satisfy AndroidX activity 1.12+ and core 1.18+ constraints
                try {
                    val compileSdkVersionMethod = android.javaClass.getMethod("compileSdkVersion", Int::class.javaPrimitiveType)
                    compileSdkVersionMethod.invoke(android, 36)
                    logger.lifecycle("Forced compileSdkVersion to 36 for project ':${project.name}'")
                } catch (e: Exception) {
                    logger.warn("Could not force compileSdkVersion for ':${project.name}': ${e.message}")
                }

                // 2. Set Java compileOptions compatibility to Java 17
                try {
                    val compileOptions = android.javaClass.getMethod("getCompileOptions").invoke(android)
                    if (compileOptions != null) {
                        val setSourceCompatibility = compileOptions.javaClass.getMethod("setSourceCompatibility", org.gradle.api.JavaVersion::class.java)
                        val setTargetCompatibility = compileOptions.javaClass.getMethod("setTargetCompatibility", org.gradle.api.JavaVersion::class.java)
                        setSourceCompatibility.invoke(compileOptions, org.gradle.api.JavaVersion.VERSION_17)
                        setTargetCompatibility.invoke(compileOptions, org.gradle.api.JavaVersion.VERSION_17)
                        logger.lifecycle("Set Java compatibility to VERSION_17 for ':${project.name}'")
                    }
                } catch (e: Exception) {
                    logger.warn("Could not set compileOptions for ':${project.name}': ${e.message}")
                }

                // 3. Set fallback namespace if not specified
                try {
                    val getNamespace = android.javaClass.getMethod("getNamespace")
                    val setNamespace = android.javaClass.getMethod("setNamespace", String::class.java)
                    if (getNamespace.invoke(android) == null) {
                        val fallbackPkg = "com.example.${project.name.replace("-", "_").replace(".", "_")}"
                        setNamespace.invoke(android, fallbackPkg)
                        logger.lifecycle("Set fallback namespace '$fallbackPkg' for project ':${project.name}'")
                    }
                } catch (e: Exception) {
                    logger.warn("Could not set fallback namespace for ':${project.name}': ${e.message}")
                }
            }
        }

        // 4. Force Kotlin compile tasks to use JVM target 17
        try {
            tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile::class.java).configureEach {
                compilerOptions {
                    jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
                }
            }
        } catch (e: Exception) {
            // Ignore if Kotlin compile tasks are not yet loaded
        }
    }

    if (state.executed) {
        configureSubprojectAndroid()
    } else {
        afterEvaluate {
            configureSubprojectAndroid()
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}

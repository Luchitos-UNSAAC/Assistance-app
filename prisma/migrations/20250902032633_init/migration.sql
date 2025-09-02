-- CreateEnum
CREATE TYPE "public"."WeekDay" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'MULTIPLE', 'CHECKBOX', 'DATE');

-- CreateEnum
CREATE TYPE "public"."CallStatus" AS ENUM ('OPEN', 'CLOSED', 'DRAFT');

-- CreateEnum
CREATE TYPE "public"."ParticipationStatus" AS ENUM ('ENROLLED', 'CONFIRMED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."Modality" AS ENUM ('PRESENTIAL', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('VOLUNTEER', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."VolunteerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'JUSTIFIED', 'LATE');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'REMINDER');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dni" TEXT,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'VOLUNTEER',
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "volunteerId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."volunteers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "status" "public"."VolunteerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendances" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "volunteerId" TEXT NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,
    "volunteerId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."calls_for_volunteers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "modality" "public"."Modality" NOT NULL DEFAULT 'PRESENTIAL',
    "requirements" TEXT,
    "benefits" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "public"."CallStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "calls_for_volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."call_participants" (
    "id" TEXT NOT NULL,
    "role" TEXT,
    "status" "public"."ParticipationStatus" NOT NULL DEFAULT 'ENROLLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "volunteerId" TEXT NOT NULL,
    "callId" TEXT NOT NULL,

    CONSTRAINT "call_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."call_participant_schedules" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "participantId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,

    CONSTRAINT "call_participant_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."call_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL DEFAULT 'TEXT',
    "required" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "callId" TEXT NOT NULL,

    CONSTRAINT "call_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."call_answers" (
    "id" TEXT NOT NULL,
    "answer" TEXT,
    "selectedOptions" TEXT,
    "dateAnswer" TIMESTAMP(3),
    "numberAnswer" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,

    CONSTRAINT "call_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."call_schedules" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "public"."WeekDay",
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "onDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "callId" TEXT NOT NULL,

    CONSTRAINT "call_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_dni_key" ON "public"."users"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "users_volunteerId_key" ON "public"."users"("volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "volunteers_email_key" ON "public"."volunteers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_volunteerId_date_key" ON "public"."attendances"("volunteerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "call_participants_volunteerId_callId_key" ON "public"."call_participants"("volunteerId", "callId");

-- CreateIndex
CREATE UNIQUE INDEX "call_participant_schedules_participantId_scheduleId_key" ON "public"."call_participant_schedules"("participantId", "scheduleId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "public"."volunteers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "public"."volunteers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "public"."volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."call_participants" ADD CONSTRAINT "call_participants_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "public"."volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."call_participants" ADD CONSTRAINT "call_participants_callId_fkey" FOREIGN KEY ("callId") REFERENCES "public"."calls_for_volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."call_participant_schedules" ADD CONSTRAINT "call_participant_schedules_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."call_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."call_participant_schedules" ADD CONSTRAINT "call_participant_schedules_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."call_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."call_questions" ADD CONSTRAINT "call_questions_callId_fkey" FOREIGN KEY ("callId") REFERENCES "public"."calls_for_volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."call_answers" ADD CONSTRAINT "call_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."call_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."call_answers" ADD CONSTRAINT "call_answers_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."call_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."call_schedules" ADD CONSTRAINT "call_schedules_callId_fkey" FOREIGN KEY ("callId") REFERENCES "public"."calls_for_volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

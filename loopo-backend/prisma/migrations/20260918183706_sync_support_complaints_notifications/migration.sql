-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketChannel" AS ENUM ('EMAIL', 'CHAT', 'WEB', 'PHONE');

-- CreateEnum
CREATE TYPE "TicketSenderType" AS ENUM ('USER', 'AGENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('SUBMITTED', 'ASSIGNED', 'INVESTIGATING', 'ACTION_REQUIRED', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ComplaintPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ComplaintSeverity" AS ENUM ('MINOR', 'MODERATE', 'MAJOR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ComplaintChannel" AS ENUM ('EMAIL', 'CHAT', 'WEB', 'PHONE');

-- CreateEnum
CREATE TYPE "ComplaintMessageType" AS ENUM ('CUSTOMER', 'VENDOR', 'INTERNAL');

-- AlterTable
ALTER TABLE "email_templates" ADD COLUMN     "body" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "userId" UUID,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userPhone" TEXT,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "channel" "TicketChannel" NOT NULL DEFAULT 'WEB',
    "assignedAgent" TEXT,
    "assignedToId" UUID,
    "relatedOrderId" TEXT,
    "relatedProductName" TEXT,
    "relatedAmount" TEXT,
    "relatedOrderStatus" TEXT,
    "lastReplyAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "senderId" UUID,
    "senderType" "TicketSenderType" NOT NULL DEFAULT 'USER',
    "senderName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_internal_notes" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "authorId" UUID,
    "authorName" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_internal_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_activity_logs" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "operator" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" UUID NOT NULL,
    "complaintNumber" TEXT NOT NULL,
    "userId" UUID,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userPhone" TEXT,
    "vendorId" UUID,
    "vendorName" TEXT,
    "relatedOrderId" TEXT,
    "relatedAmount" TEXT,
    "relatedOrderStatus" TEXT,
    "subjectTitle" TEXT NOT NULL,
    "subjectDescription" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "ComplaintPriority" NOT NULL DEFAULT 'MEDIUM',
    "severity" "ComplaintSeverity" NOT NULL DEFAULT 'MODERATE',
    "status" "ComplaintStatus" NOT NULL DEFAULT 'SUBMITTED',
    "channel" "ComplaintChannel" NOT NULL DEFAULT 'EMAIL',
    "assignedDepartment" TEXT,
    "assignedAgent" TEXT,
    "assignedToId" UUID,
    "targetResolutionAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "evidenceFiles" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_messages" (
    "id" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "senderId" UUID,
    "senderType" "ComplaintMessageType" NOT NULL DEFAULT 'CUSTOMER',
    "senderName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_investigation_notes" (
    "id" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "authorId" UUID,
    "authorName" TEXT NOT NULL,
    "findings" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_investigation_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_resolutions" (
    "id" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "resolutionType" TEXT NOT NULL,
    "amount" TEXT,
    "summary" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_activity_logs" (
    "id" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "operator" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_notifications_userId_createdAt_idx" ON "user_notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_notifications_userId_isRead_idx" ON "user_notifications"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_priority_idx" ON "support_tickets"("priority");

-- CreateIndex
CREATE INDEX "support_tickets_category_idx" ON "support_tickets"("category");

-- CreateIndex
CREATE INDEX "support_tickets_ticketNumber_idx" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "support_tickets_userEmail_idx" ON "support_tickets"("userEmail");

-- CreateIndex
CREATE INDEX "ticket_messages_ticketId_idx" ON "ticket_messages"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_internal_notes_ticketId_idx" ON "ticket_internal_notes"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_activity_logs_ticketId_idx" ON "ticket_activity_logs"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_complaintNumber_key" ON "complaints"("complaintNumber");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "complaints_priority_idx" ON "complaints"("priority");

-- CreateIndex
CREATE INDEX "complaints_category_idx" ON "complaints"("category");

-- CreateIndex
CREATE INDEX "complaints_complaintNumber_idx" ON "complaints"("complaintNumber");

-- CreateIndex
CREATE INDEX "complaints_userEmail_idx" ON "complaints"("userEmail");

-- CreateIndex
CREATE INDEX "complaint_messages_complaintId_idx" ON "complaint_messages"("complaintId");

-- CreateIndex
CREATE INDEX "complaint_investigation_notes_complaintId_idx" ON "complaint_investigation_notes"("complaintId");

-- CreateIndex
CREATE INDEX "complaint_resolutions_complaintId_idx" ON "complaint_resolutions"("complaintId");

-- CreateIndex
CREATE INDEX "complaint_activity_logs_complaintId_idx" ON "complaint_activity_logs"("complaintId");

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_internal_notes" ADD CONSTRAINT "ticket_internal_notes_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_internal_notes" ADD CONSTRAINT "ticket_internal_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_activity_logs" ADD CONSTRAINT "ticket_activity_logs_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_messages" ADD CONSTRAINT "complaint_messages_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_messages" ADD CONSTRAINT "complaint_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_investigation_notes" ADD CONSTRAINT "complaint_investigation_notes_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_investigation_notes" ADD CONSTRAINT "complaint_investigation_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_resolutions" ADD CONSTRAINT "complaint_resolutions_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_activity_logs" ADD CONSTRAINT "complaint_activity_logs_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;


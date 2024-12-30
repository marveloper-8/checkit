CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "idx_messages_chat_room_id" ON "Message"("chatRoomId");
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "Message"("createdAt");
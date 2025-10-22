-- CreateTable
CREATE TABLE "cmds" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "usages" INTEGER DEFAULT 0,

    CONSTRAINT "cmds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hunts" (
    "user_id" VARCHAR NOT NULL,
    "demon_tries" INTEGER DEFAULT 0,
    "demon_success" INTEGER DEFAULT 0,
    "demon_hunted" INTEGER DEFAULT 0,
    "giant_tries" INTEGER DEFAULT 0,
    "giant_success" INTEGER DEFAULT 0,
    "giant_hunted" INTEGER DEFAULT 0,
    "angel_tries" INTEGER DEFAULT 0,
    "angel_success" INTEGER DEFAULT 0,
    "angel_hunted" INTEGER DEFAULT 0,
    "archangel_tries" INTEGER DEFAULT 0,
    "archangel_success" INTEGER DEFAULT 0,
    "archangel_hunted" INTEGER DEFAULT 0,
    "demigod_tries" INTEGER DEFAULT 0,
    "demigod_success" INTEGER DEFAULT 0,
    "demigod_hunted" INTEGER DEFAULT 0,
    "god_tries" INTEGER DEFAULT 0,
    "god_success" INTEGER DEFAULT 0,
    "god_hunted" INTEGER DEFAULT 0,

    CONSTRAINT "hunts_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "roletauser" (
    "user_id" VARCHAR(20) NOT NULL,
    "earn_money" INTEGER DEFAULT 0,
    "lost_money" INTEGER DEFAULT 0,
    "lost_games" INTEGER DEFAULT 0,
    "won_games" INTEGER DEFAULT 0,

    CONSTRAINT "roletauser_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "pokeruser" (
    "user_id" VARCHAR(20) NOT NULL,
    "earn_money" INTEGER DEFAULT 0,
    "lost_money" INTEGER DEFAULT 0,
    "lost_games" INTEGER DEFAULT 0,
    "won_games" INTEGER DEFAULT 0,
    "royal_flush" INTEGER DEFAULT 0,
    "straight_flush" INTEGER DEFAULT 0,
    "four_of_a_kind" INTEGER DEFAULT 0,
    "full_house" INTEGER DEFAULT 0,
    "flush" INTEGER DEFAULT 0,
    "straight" INTEGER DEFAULT 0,
    "three_of_a_kind" INTEGER DEFAULT 0,
    "two_pair" INTEGER DEFAULT 0,
    "pair" INTEGER DEFAULT 0,
    "high_card" INTEGER DEFAULT 0,
    "folded" INTEGER DEFAULT 0,

    CONSTRAINT "pokeruser_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "rockpaperscissorsuser" (
    "user_id" VARCHAR(20) NOT NULL,
    "earn_money" INTEGER DEFAULT 0,
    "lost_money" INTEGER DEFAULT 0,
    "lost_games" INTEGER DEFAULT 0,
    "won_games" INTEGER DEFAULT 0,
    "total_games" INTEGER DEFAULT 0,
    "rock" INTEGER DEFAULT 0,
    "paper" INTEGER DEFAULT 0,
    "scissors" INTEGER DEFAULT 0,

    CONSTRAINT "rockpaperscissorsuser_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(20) NOT NULL,
    "uses" INTEGER DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uses" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(20),
    "cmd_id" INTEGER,
    "guild_id" VARCHAR(20) NOT NULL,
    "date" BIGINT,
    "args" TEXT,

    CONSTRAINT "uses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bichouser" (
    "user_id" VARCHAR(20) NOT NULL,
    "earn_money" INTEGER DEFAULT 0,
    "lost_money" INTEGER DEFAULT 0,
    "lost_games" INTEGER DEFAULT 0,
    "won_games" INTEGER DEFAULT 0,

    CONSTRAINT "bichouser_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "blackjackuser" (
    "user_id" VARCHAR(20) NOT NULL,
    "earn_money" INTEGER DEFAULT 0,
    "lost_money" INTEGER DEFAULT 0,
    "lost_games" INTEGER DEFAULT 0,
    "won_games" INTEGER DEFAULT 0,

    CONSTRAINT "blackjackuser_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "coinflipuser" (
    "user_id" VARCHAR(20) NOT NULL,
    "earn_money" INTEGER DEFAULT 0,
    "lost_money" INTEGER DEFAULT 0,
    "lost_games" INTEGER DEFAULT 0,
    "won_games" INTEGER DEFAULT 0,

    CONSTRAINT "coinflipuser_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "weekly_hunts" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(20) NOT NULL,
    "hunt_type" VARCHAR(10) NOT NULL,
    "hunted" INTEGER NOT NULL,
    "hunted_at" DATE NOT NULL DEFAULT CURRENT_DATE,
    "user_tag" VARCHAR(40),

    CONSTRAINT "weekly_hunts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "author_id" VARCHAR(20) NOT NULL,
    "target_id" VARCHAR(20) NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency_type" VARCHAR(15) NOT NULL,
    "reason" VARCHAR(40) NOT NULL,
    "date" BIGINT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmuser" (
    "user_id" VARCHAR(20) NOT NULL,
    "plant" INTEGER NOT NULL,
    "harvest" INTEGER DEFAULT 0,
    "rotted" INTEGER DEFAULT 0
);

-- CreateTable
CREATE TABLE "usercmds" (
    "user_id" VARCHAR(20) NOT NULL,
    "cmd_id" INTEGER NOT NULL,
    "uses" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "bichogames" (
    "id" SERIAL NOT NULL,
    "date" BIGINT,
    "players" JSONB,
    "results" TEXT NOT NULL,

    CONSTRAINT "bichogames_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "farmuser_user_id_plant_key" ON "farmuser"("user_id", "plant");

-- CreateIndex
CREATE UNIQUE INDEX "usercmds_user_id_cmd_id_key" ON "usercmds"("user_id", "cmd_id");

-- AddForeignKey
ALTER TABLE "hunts" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roletauser" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pokeruser" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rockpaperscissorsuser" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "uses" ADD CONSTRAINT "uses_cmd_id_fkey" FOREIGN KEY ("cmd_id") REFERENCES "cmds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "uses" ADD CONSTRAINT "uses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bichouser" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "blackjackuser" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "coinflipuser" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weekly_hunts" ADD CONSTRAINT "weekly_hunts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "farmuser" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usercmds" ADD CONSTRAINT "usercmds_cmd_id_fkey" FOREIGN KEY ("cmd_id") REFERENCES "cmds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usercmds" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
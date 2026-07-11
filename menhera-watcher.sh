#!/bin/bash

BUILD_LOG=".watch_build.log"
RESTART_DELAY=2

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\e[1;30m'
NC='\033[0m'

APP_PID=""
APP_RUNNING=false
BUILDER_PID=""
AUTO_RESTART=false

FIRST_BUILD=true
RESTART_PENDING=false
BUILD_FINISH_TIME=0
LAST_LOG_LINE=0

if [[ ! -z $1 ]]; then
    AUTO_RESTART=true
fi

cleanup() {
    echo -e "\n${RED}[SYSTEM] Shutdown...${NC}"
    if [[ -n "$APP_PID" ]]; then kill "$APP_PID" 2>/dev/null; fi
    if [[ -n "$BUILDER_PID" ]]; then kill "$BUILDER_PID" 2>/dev/null; fi
    rm -f "$BUILD_LOG" 2>/dev/null

    wait $APP_PID $BUILDER_PID 2>/dev/null

    stty echo
    exit
}

trap cleanup SIGINT SIGTERM

start_app() {
    if [ "$APP_RUNNING" = true ]; then
        echo -e "${YELLOW}[SYSTEM] Shutting down...${NC}"
        kill "$APP_PID" 2>/dev/null
        wait "$APP_PID" 2>/dev/null
    fi

    echo -e "${GREEN}[SYSTEM] Starting application (pnpm events dev)...${NC}"

    (
        cd packages/events || exit 1
        VERSION="$(node -p 'require("./package.json").version')" \
            NODE_ENV=development \
            exec node -r dotenv/config .
    ) &

    APP_PID=$!
    APP_RUNNING=true
}

start_builder() {
    : > "$BUILD_LOG"

    echo -e "${BLUE}[BUILD] Starting tsc in watch mode...${NC}"

    pnpm --silent events exec tsc \
        --watch --preserveWatchOutput \
        --rootDir ./src \
        --project tsconfig.build.json \
        > "$BUILD_LOG" 2>&1 &

    BUILDER_PID=$!
}

process_build_log() {
    local total
    total=$(wc -l < "$BUILD_LOG" 2>/dev/null || echo 0)

    if [ "$total" -le "$LAST_LOG_LINE" ]; then
        return
    fi

    local new_lines
    new_lines=$(sed -n "$((LAST_LOG_LINE + 1)),${total}p" "$BUILD_LOG")
    LAST_LOG_LINE=$total

    while IFS= read -r line; do
        [ -z "$line" ] && continue
        echo -e "${GRAY}[TSC] ${line}${NC}"
    done <<< "$new_lines"

    if echo "$new_lines" | grep -q "Watching for file changes"; then
        if echo "$new_lines" | grep -q "Found 0 errors"; then
            echo -e "${GREEN}[BUILD] Build successful.${NC}"
            BUILD_FINISH_TIME=$(date +%s)
            RESTART_PENDING=true
        else
            echo -e "${RED}[BUILD] Build failed.${NC}"
        fi
    fi
}

handle_pending_restart() {
    [ "$RESTART_PENDING" = false ] && return

    local now
    now=$(date +%s)

    if [ $((now - BUILD_FINISH_TIME)) -lt "$RESTART_DELAY" ]; then
        return
    fi

    RESTART_PENDING=false

    if [ "$FIRST_BUILD" = true ]; then
        FIRST_BUILD=false
        start_app
    elif [ "$AUTO_RESTART" = true ]; then
        echo -e "${GRAY}[SYSTEM] Auto restart is enabled${NC}"
        start_app
    else
        echo -e "${YELLOW}[HINT] Press 'R' to restart the app with new build.${NC}"
    fi
}

toggle_autoreload() {
    if [ $AUTO_RESTART = true ]; then
        AUTO_RESTART=false
        echo -e "${YELLOW}[SYSTEM] Auto Reload is ${RED}disabled!${NC}"
    else
        AUTO_RESTART=true
        echo -e "${YELLOW}[SYSTEM] Auto Reload is ${GREEN}enabled!${NC}"
    fi
}

print_help() {
    echo -e "${GREEN}=== Menhera Watcher ===${NC}"
    echo -e "Controls:"
    echo -e "  [A] Toggle Auto Reload"
    echo -e "  [C] Clear Logs"
    echo -e "  [R] Restart App (pnpm events dev)"
    echo -e "  [Q] Quit"
    echo -e "-----------------------------"
    echo -e
}

clear

print_help

if [ "$AUTO_RESTART" = true ]; then
    echo -e "${YELLOW}[SYSTEM] Auto Reload is ${GREEN}enabled!${NC}"
fi

start_builder

while true; do
    read -t 0.1 -n 1 -s key

    case $key in
        [rR]) start_app ;;
        [aA]) toggle_autoreload ;;
        [cC])
            clear
            print_help
            echo -e "${GREEN}========== Logs Cleared ==========${NC}"
            echo -e "${YELLOW}[STATE] App is running (PID: $APP_PID)${NC}"
            [ "$AUTO_RESTART" = true ] && echo -e "${YELLOW}[SYSTEM] Auto Reload is ${GREEN}enabled!${NC}"
            ;;
        [qQ]) cleanup ;;
    esac

    if [ "$APP_RUNNING" = true ] && [[ -n "$APP_PID" ]] && ! kill -0 "$APP_PID" 2>/dev/null; then
        APP_RUNNING=false
        wait "$APP_PID" 2>/dev/null
        echo -e "${RED}[SYSTEM] Application process (PID: $APP_PID) has died!${NC}"
    fi

    if [[ -n "$BUILDER_PID" ]] && ! kill -0 "$BUILDER_PID" 2>/dev/null; then
        echo -e "${RED}[SYSTEM] Builder process (tsc) has died! Restarting...${NC}"
        start_builder
    fi

    process_build_log
    handle_pending_restart
done

#!/bin/bash

WATCH_DIR="./packages/events"
FILE_PATTERN=".*\.ts$"
BUILD_DELAY=4

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\e[1;30m'
NC='\033[0m'

if ! command -v inotifywait &> /dev/null; then
    echo -e "${RED}[ERROR] 'inotifywait' is not installed.${NC}"
    echo -e "This tool is required to watch for file changes."
    echo -e "${YELLOW}To install:${NC}"
    echo -e "  - Ubuntu/Debian: sudo apt-get install inotify-tools"
    echo -e "  - MacOS: brew install inotify-tools"
    exit 1
fi

APP_PID=""
WATCHER_PID=""
LAST_CHANGE_TIME=0
BUILD_PENDING=false
LAST_BUILD_TIME=0
AUTO_RESTART=false

if [[ $1 == "autoreload" ]]; then
    AUTO_RESTART=true
fi

cleanup() {
    echo -e "\n${RED}[SYSTEM] Requesting shut down...${NC}"
    if [[ -n "$APP_PID" ]]; then kill "$APP_PID" 2>/dev/null; fi
    if [[ -n "$WATCHER_PID" ]]; then kill "$WATCHER_PID" 2>/dev/null; fi
    rm -f .watch_trigger 2>/dev/null

    MAIN_PID="$(pgrep -f 'node -r dotenv/config .')"
    kill "$MAIN_PID" 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

start_app() {
    if [[ -n "$APP_PID" ]]; then
        echo -e "${YELLOW}[SYSTEM] Shutting down...${NC}"
        kill "$APP_PID" 2>/dev/null
        wait "$APP_PID" 2>/dev/null

        MAIN_PID="$(pgrep -f 'node -r dotenv/config .')"
        kill "$MAIN_PID" 2>/dev/null
        wait "$MAIN_PID" 2>/dev/null
        sleep 1
    fi

    echo -e "${GREEN}[SYSTEM] Starting application (pnpm events dev)...${NC}"
    npm --prefix packages/events run dev --silent &

    APP_PID=$!
}

run_build() {
    echo -e "${BLUE}[BUILD] Starting build...${NC}"
    
    pnpm --silent events build

    BUILD_PENDING=false 
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[BUILD] Build successful.${NC}"

        if [ "$LAST_BUILD_TIME" -gt 0 ]; then
            if [ "$AUTO_RESTART" = true ]; then
                echo -e "${GRAY}[SYSTEM] Auto restart is enabled${NC}"
                start_app
            else
                echo -e "${YELLOW}[HINT] Press 'R' to restart the app with new build.${NC}"
            fi
        fi
    else
        echo -e "${RED}[BUILD] Build failed.${NC}"
    fi

    LAST_BUILD_TIME="$(date +%s)"
}

start_watcher() {
    touch .watch_trigger

    inotifywait -m -r -e modify,create,delete,move \
        --include "$FILE_PATTERN" \
        --format "%T" --timefmt "%s" \
        "$WATCH_DIR" > .watch_trigger 2>/dev/null & 
    
    WATCHER_PID=$!
}

clear
echo -e "${GREEN}=== Menhera Watcher ===${NC}"
echo -e "Controls:"
echo -e "  [R] Restart App (pnpm events dev)"
echo -e "  [B] Force Build (pnpm events build)"
echo -e "  [C] Clear Logs"
echo -e "  [Q] Quit"
echo -e "-----------------------------"
echo -e

if [ "$AUTO_RESTART" = true ]; then
    echo -e "${YELLOW}[SYSTEM] Auto Reload is enabled!${NC}"          
fi

start_watcher
run_build
start_app

LAST_READ_LINE=0

while true; do
    read -t 0.1 -n 1 -s key
    
    if [[ $key == "r" || $key == "R" ]]; then
        start_app
    elif [[ $key == "b" || $key == "B" ]]; then
        echo -e "${BLUE}[SYSTEM] Force build triggered.${NC}"
        run_build
    elif [[ $key == "c" || $key == "C" ]]; then
        clear
        echo -e "${GREEN}========== Logs Cleared ==========${NC}"
        echo -e "${YELLOW}[STATE] App is running (PID: $APP_PID)${NC}"

        if [ "$AUTO_RESTART" = true ]; then
            echo -e "${YELLOW}[SYSTEM] Auto Reload is enabled!${NC}"          
        fi
    elif [[ $key == "q" || $key == "Q" ]]; then
        cleanup
    fi

    CURRENT_LINES=$(wc -l < .watch_trigger 2>/dev/null || echo 0)
    
    if [ "$CURRENT_LINES" -gt "$LAST_READ_LINE" ]; then
        LAST_CHANGE_TIME=$(date +%s)
        LAST_READ_LINE=$CURRENT_LINES

        BUILD_DIFF=$((LAST_CHANGE_TIME - LAST_BUILD_TIME))
        
        if [ "$BUILD_DIFF" -ge "$BUILD_DELAY" ]; then
            BUILD_PENDING=true
            echo -e "${GRAY}[SYSTEM] Change detected!${NC}"
        fi

    fi

    if [ "$BUILD_PENDING" = true ]; then
        CURRENT_TIME=$(date +%s)
        TIME_DIFF=$((CURRENT_TIME - LAST_CHANGE_TIME))

        if [ "$TIME_DIFF" -ge "$BUILD_DELAY" ]; then
            echo -e "${BLUE}[SYSTEM] Last change is too old. We gotta build!${NC}"
            run_build
        fi
    fi
done
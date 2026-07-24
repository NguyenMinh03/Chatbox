# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack chatbox application using Express/MongoDB (backend) and React (frontend, not yet initialized). The project uses ES modules throughout.

## Commands

### Backend (run from `backend/` directory)

```bash
# Install dependencies
npm install

# Start development server (nodemon auto-reload)
npm run dev

# Start production server
npm start
```

No test or lint commands are configured yet.

### Frontend

Not yet initialized (empty `frontend/` directory).

## Architecture

- **Backend**: Express v5 server at `backend/src/server.js`, configured on port 5001 (via `backend/.env`)
- **Database**: Mongoose v9 is installed for MongoDB, but no models or connections are implemented yet
- **CORS**: `cors` package is installed for cross-origin requests between frontend and backend
- **Module system**: ES modules (`"type": "module"` in package.json)

## Environment

Backend environment variables go in `backend/.env`. Currently only `PORT=5001` is defined. The `.gitignore` excludes `.env` files but allows `.env.example`.

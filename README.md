# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
- MediaPipe Tasks Vision

## CV backend

The trained sign model is in `public/models`, with tracking and verification in
`src/cv`. The recognizer contract and live webcam adapter are in
`src/recognizer`. Camera mode uses the live webcam in gameplay and practice.
Its word and sentence banks are restricted to the model's 11 supported labels.
The pre-game camera check must pass before camera gameplay starts, and the
active target includes an attributed NTU SgSL Sign Bank example. Run on
localhost or HTTPS and grant camera permission when prompted.


# VKIS Automated Daily Lesson Log Creator

This app is powered by the Gemini API to generate professional DepEd-compliant Lesson Logs.

## How to Deploy to Vercel

1. **Push to GitLab**: Upload all files in this directory to your GitLab repository.
2. **Import to Vercel**: 
   - Log in to [Vercel](https://vercel.com).
   - Click "Add New" -> "Project".
   - Import your GitLab repository.
3. **Configure Environment Variables**:
   - In the Vercel project settings, go to **Environment Variables**.
   - Add a key named `API_KEY`.
   - Paste your Gemini API Key as the value.
4. **Deploy**: Click "Deploy". Vercel will detect the Vite configuration and build the app automatically.

## Local Development

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`

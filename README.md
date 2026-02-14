# Valentine's Day Website for Leah — Matisse Cut-Out Style

A personalized, interactive Valentine's Day website with a Matisse-inspired aesthetic featuring animated photo reveals.

## 🎨 Features
- **Matisse-Inspired Design**: Soft pastel colors and organic shapes
- **Interactive Photo Gallery**: Click shapes to reveal photos with brush-stroke animations
- **Fully Responsive**: Mobile-first design that works beautifully on all devices
- **Three Sections**: Landing page → Photo gallery → Closing message

## 📸 How to Add Your Photos

1. **Prepare 6 photos** (you can add up to 8 if you want more):
   - Name them `photo1.jpg`, `photo2.jpg`, `photo3.jpg`, etc.
   - For best results, use square or near-square photos (they'll be cropped to fit)
   - Place them in the `images/` folder

2. **Customize the captions**:
   - Open `index.html`
   - Find each `<p class="caption">` tag
   - Replace the placeholder text with your own memory descriptions

3. **Customize the closing message**:
   - Open `index.html`
   - Scroll to the `<section id="closing">` section
   - Edit the text inside `<p class="closing-message">` and `<p class="closing-signature">`

## 🧪 Testing Locally

1. Open `index.html` in a web browser (double-click the file)
2. Click "Begin" to see the gallery
3. Click each colored shape to reveal photos
4. Click "Continue" to see the closing message
5. Test on mobile viewport (Chrome DevTools, F12 → Toggle device toolbar)

## 🚀 Deploy to GitHub Pages

### Step 1: Create a GitHub Repository
1. Go to [github.com](https://github.com) and log in
2. Click the "+" icon → "New repository"
3. Name it something like `valentines-for-leah`
4. Choose "Public" or "Private" (both work with GitHub Pages)
5. Click "Create repository"

### Step 2: Upload Your Files
**Option A: Upload via GitHub Website**
1. On your new repository page, click "uploading an existing file"
2. Drag and drop all files: `index.html`, `style.css`, `script.js`, and the `images` folder
3. Click "Commit changes"

**Option B: Use Git Command Line**
```bash
cd C:\Users\buddy\Projects\Valentines
git init
git add .
git commit -m "Initial commit - Valentine's Day website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/valentines-for-leah.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings" (top menu)
3. Click "Pages" (left sidebar)
4. Under "Source", select "Deploy from a branch"
5. Under "Branch", select "main" and "/ (root)"
6. Click "Save"
7. Wait 1-2 minutes, then your site will be live at:
   ```
   https://YOUR-USERNAME.github.io/valentines-for-leah/
   ```

## 🎁 Sharing the Link

Once deployed, send Leah the GitHub Pages URL. She can open it on her phone or computer and interact with the photo gallery!

## 📝 Adding or Removing Photos

To add a 7th or 8th photo:
1. Copy one of the existing `<div class="gallery-card">` blocks in `index.html`
2. Paste it below the last photo
3. Update the `data-index`, `mask id`, and `href` attributes (increment the numbers)
4. Add your new photo to the `images/` folder
5. Update the caption

To remove photos:
1. Delete the entire `<div class="gallery-card">` block for that photo
2. Remove the corresponding image file from `images/`

## 🎨 Color Palette

The website uses these Matisse-inspired pastel colors:
- **Coral**: #E8B4A0
- **Pale Blue**: #A8C5D1
- **Muted Gold**: #D4AF88
- **Sage Green**: #9DB89A
- **Lavender**: #C9B3D4
- **Cream**: #FAF7F2 (background)

You can customize these in `style.css` under the `:root` section.

## 🐛 Troubleshooting

**Photos not showing?**
- Make sure photos are in the `images/` folder
- Check that filenames match exactly (case-sensitive on some systems)

**Brush animation not working?**
- This is a known issue on some older mobile browsers
- The photo will still reveal, just without the animated brush effect
- Works best on modern Chrome, Safari, and Firefox

**Site not loading on GitHub Pages?**
- Wait 2-3 minutes after enabling GitHub Pages
- Check that `index.html` is in the root directory (not in a subfolder)
- Make sure the repository is not empty

## 💝 Happy Valentine's Day!

Enjoy creating this special gift for Leah!

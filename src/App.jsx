/* eslint-disable react/prop-types */
import { useState } from 'react'
import { Upload } from 'lucide-react'
import {
  SiInstagram,
  SiFacebook,
  SiTiktok,
  SiX
} from "react-icons/si"

const platformInfo = {
  instagram: {
    inputLabel: 'Username',
    placeholder: 'username without @',
    instructions: 'Enter your Instagram username without the @ symbol',
    icon: SiInstagram,
    color: '#E4405F'
  },
  facebook: {
    inputLabel: 'Page ID',
    placeholder: 'Numeric ID required',
    instructions: `To get your Facebook Page ID:
1. Go to www.facebook.com/YOUR_PAGE_NAME
2. Click "About" on the left sidebar
3. Scroll down to "Page ID"`,
    icon: SiFacebook,
    color: '#1877F2'
  },
  tiktok: {
    inputLabel: 'Username',
    placeholder: '@username',
    instructions: 'Enter your TikTok username including the @ symbol',
    icon: SiTiktok,
    color: '#000000'
  },
  x: {
    inputLabel: 'Username',
    placeholder: '@username',
    instructions: 'Enter your X (Twitter) username including the @ symbol',
    icon: SiX,
    color: '#000000'
  }
}

const PlatformIcon = ({ platform }) => {
  const Icon = platformInfo[platform].icon
  return <Icon size={20} color={platformInfo[platform].color} />
}

const PlatformOption = ({ value }) => {
  const Icon = platformInfo[value].icon
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} color={platformInfo[value].color} />
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </div>
  )
}

const QRCodeWithLogo = ({ url, platform, customLogo }) => {
  const Icon = platformInfo[platform].icon;

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=FFFFFF&format=svg&qzone=4&margin=2&ecc=H`;

  return (
    <div className="relative">
      <img
        src={qrApiUrl}
        alt="QR Code"
        className="w-full rounded-lg"
      />
      {customLogo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-2 rounded-lg">
            {customLogo === 'default' ? (
              <Icon size={32} color={platformInfo[platform].color} />
            ) : (
              <img src={customLogo} alt="Custom logo" className="w-8 h-8 object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [platform, setPlatform] = useState('')
  const [username, setUsername] = useState('')
  const [links, setLinks] = useState(null)
  const [customLogo, setCustomLogo] = useState(null)

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCustomLogo(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePlatformChange = (e) => {
    setPlatform(e.target.value)
    setUsername('')
    setLinks(null)
  }

  const generateLinks = (e) => {
    e.preventDefault()
    const linkData = {
      instagram: {
        deepLink: `instagram://user?username=${username}`,
        webLink: `https://instagram.com/${username}`
      },
      facebook: {
        deepLink: `fb://page/${username}`,
        webLink: `https://facebook.com/${username}`
      },
      tiktok: {
        deepLink: `tiktok://${username.startsWith('@') ? username : '@' + username}`,
        webLink: `https://tiktok.com/${username.startsWith('@') ? username : '@' + username}`
      },
      x: {
        deepLink: `twitter://user?screen_name=${username.replace('@', '')}`,
        webLink: `https://x.com/${username.replace('@', '')}`
      }
    }
    setLinks(linkData[platform])
  }

  const downloadQR = async (type, platform, username, links, customLogo, platformInfo) => {
    if (!links) return;

    try {
      const url = type === 'deep' ? links.deepLink : links.webLink;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(url)}&bgcolor=FFFFFF&format=png&qzone=2&margin=0&ecc=H`;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1024;
      canvas.height = 1024;

      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
      qrImage.src = qrUrl;

      await new Promise((resolve, reject) => {
        qrImage.onload = async () => {
          const qrWidth = qrImage.width;
          const qrHeight = qrImage.height;
          const scale = Math.min(canvas.width / qrWidth, canvas.height / qrHeight);
          const scaledWidth = qrWidth * scale;
          const scaledHeight = qrHeight * scale;
          const x = (canvas.width - scaledWidth) / 2;
          const y = (canvas.height - scaledHeight) / 2;

          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(qrImage, x, y, scaledWidth, scaledHeight);

          if (customLogo) {
            const canvasCenter = canvas.width / 2;
            const logoSize = Math.round(canvas.width * 0.2);
            const padding = Math.round(logoSize * 0.1);
            const totalSize = logoSize + (padding * 2);
            const startX = canvasCenter - (totalSize / 2);
            const startY = canvasCenter - (totalSize / 2);
            const cornerRadius = Math.round(totalSize * 0.2);

            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(startX + cornerRadius, startY);
            ctx.lineTo(startX + totalSize - cornerRadius, startY);
            ctx.quadraticCurveTo(startX + totalSize, startY, startX + totalSize, startY + cornerRadius);
            ctx.lineTo(startX + totalSize, startY + totalSize - cornerRadius);
            ctx.quadraticCurveTo(startX + totalSize, startY + totalSize, startX + totalSize - cornerRadius, startY + totalSize);
            ctx.lineTo(startX + cornerRadius, startY + totalSize);
            ctx.quadraticCurveTo(startX, startY + totalSize, startX, startY + totalSize - cornerRadius);
            ctx.lineTo(startX, startY + cornerRadius);
            ctx.quadraticCurveTo(startX, startY, startX + cornerRadius, startY);
            ctx.closePath();
            ctx.fill();

            if (customLogo === 'default') {
              const Icon = platformInfo[platform]?.icon;
              if (!Icon) {
                console.error('Platform icon not found');
                return;
              }

              const getIconPath = (platform) => {
                switch (platform) {
                  case 'instagram':
                    return 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z';
                  case 'facebook':
                    return 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z';
                  case 'tiktok':
                    return 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z';
                  case 'x':
                    return 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z';
                  default:
                    return '';
                }
              };

              const iconPath = getIconPath(platform);
              const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${logoSize}" height="${logoSize}" viewBox="0 0 24 24">
                <path fill="${platformInfo[platform].color}" d="${iconPath}"/>
              </svg>`;

              await new Promise((logoResolve) => {
                const img = new Image();
                img.src = `data:image/svg+xml;base64,${btoa(svgStr)}`;
                img.onload = () => {
                  ctx.drawImage(img, startX + padding, startY + padding, logoSize, logoSize);
                  logoResolve();
                };
              });
            } else {
              await new Promise((logoResolve) => {
                const logoImg = new Image();
                logoImg.src = customLogo;
                logoImg.onload = () => {
                  ctx.drawImage(logoImg, startX + padding, startY + padding, logoSize, logoSize);
                  logoResolve();
                };
              });
            }
          }

          canvas.toBlob((blob) => {
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `${platform}_${username}_${type}_qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            resolve();
          }, 'image/png');
        };
        qrImage.onerror = reject;
      });
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-400 via-rose-100 to-lime-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Social Deep Links
        </h1>

        <form onSubmit={generateLinks} className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Platform</label>
            <select
              value={platform}
              onChange={handlePlatformChange}
              className="mt-1 block w-full rounded-xl border border-gray-200 p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
            >
              <option value="">Choose a platform</option>
              {Object.entries(platformInfo).map(([value]) => (
                <option key={value} value={value}>
                  <PlatformOption value={value} />
                </option>
              ))}
            </select>
          </div>

          {platform && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h3 className="font-medium text-blue-800 flex items-center gap-2">
                <PlatformIcon platform={platform} /> Instructions
              </h3>
              <pre className="mt-2 text-sm text-blue-700 whitespace-pre-wrap">
                {platformInfo[platform].instructions}
              </pre>
            </div>
          )}

          {platform && (
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {platformInfo[platform].inputLabel}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-200 p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                  placeholder={platformInfo[platform].placeholder}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Include Logo in QR</label>
                <button
                  type="button"
                  onClick={() => setCustomLogo(customLogo ? null : 'default')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${customLogo ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  {customLogo ? 'Yes' : 'No'}
                </button>
              </div>
            </div>
          )}

          {platform && (
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl py-3 px-4 hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg shadow-blue-500/20"
            >
              Generate Links
            </button>
          )}
        </form>

        {links && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-2">Deep Link</h2>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <code className="text-sm text-gray-800">{links.deepLink}</code>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-2">Web Link</h2>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <code className="text-sm text-gray-800">{links.webLink}</code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-gray-500">Deep Link QR</h2>
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <QRCodeWithLogo url={links.deepLink} platform={platform} customLogo={customLogo} />
                </div>
                <label className="block w-full cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded-lg shadow-sm transition-colors text-center mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <span className="text-sm text-gray-600 flex items-center justify-center gap-2">
                    <Upload size={16} />
                    Upload Logo
                  </span>
                </label>
                <button
                  onClick={() => downloadQR('deep', platform, username, links, customLogo, platformInfo)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl py-2 px-4 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-sm font-medium shadow-lg shadow-emerald-500/20"
                >
                  Download QR
                </button>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-medium text-gray-500">Web Link QR</h2>
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <QRCodeWithLogo url={links.webLink} platform={platform} customLogo={customLogo} />
                </div>
                <label className="block w-full cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded-lg shadow-sm transition-colors text-center mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <span className="text-sm text-gray-600 flex items-center justify-center gap-2">
                    <Upload size={16} />
                    Upload Logo
                  </span>
                </label>
                <button
                  onClick={() => downloadQR('web', platform, username, links, customLogo, platformInfo)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl py-2 px-4 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-sm font-medium shadow-lg shadow-emerald-500/20"
                >
                  Download QR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
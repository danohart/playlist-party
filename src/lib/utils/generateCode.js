export function generatePartyCode() {
  const words = [
    'VIBE', 'BEAT', 'TUNE', 'WAVE', 'ECHO', 'FLOW', 'MOOD', 
    'SOUL', 'FUNK', 'JAZZ', 'ROCK', 'STAR', 'MOON', 'SUN'
  ];
  
  const word = words[Math.floor(Math.random() * words.length)];
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `${word}-${year}-${random}`;
}

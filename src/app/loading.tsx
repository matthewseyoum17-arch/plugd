export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Outer rotating ring */}
        <div className="absolute w-24 h-24 rounded-full border-t-2 border-r-2 border-primary animate-spin" style={{ animationDuration: '1.5s' }} />
        
        {/* Inner reverse rotating ring */}
        <div className="absolute w-16 h-16 rounded-full border-b-2 border-l-2 border-accent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
        
        {/* Center glowing dot */}
        <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" />
      </div>
      
      <p className="mt-8 text-gray-400 font-button tracking-widest text-sm uppercase animate-pulse">
        Initializing Datacore...
      </p>
    </div>
  )
}

export function TailwindIndicator() {
  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="bg-text-primary text-caption-1-regular text-background-primary-default fixed bottom-1 left-1 z-50 flex size-6 items-center justify-center rounded-full p-3 font-mono">
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block">xl</div>
    </div>
  )
}

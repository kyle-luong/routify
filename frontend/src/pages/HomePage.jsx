import FileUpload from '../components/FileUpload';

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 md:px-8">
      <div className="h-full w-full max-w-6xl rounded-xl border border-slate-200 bg-white p-10 shadow-md md:grid md:h-[82vh] md:grid-cols-2 md:gap-12">
        {/* Left Side: Hero Text + Upload */}
        <div className="flex w-full flex-col items-center justify-center">
          <div className="w-full max-w-xl space-y-10">
            <h1 className="text-5xl leading-tight font-bold text-slate-900">
              Map your schedule.
              <br />
              Share your day.
            </h1>
            <p className="max-w-prose text-lg text-slate-600">
              Upload your calendar and get a smarter, visual view of your day. Align creates a
              sharable, location-aware schedule — complete with travel times and map-based context.
            </p>
            <FileUpload />
          </div>
        </div>

        {/* Right Side: Map Preview */}
        <div className="flex items-center justify-center">
          <div className="flex h-[440px] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-500">
            Map preview
          </div>
        </div>
      </div>
    </div>
  );
}

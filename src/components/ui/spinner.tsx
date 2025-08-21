// components/ui/spinner.tsx
export function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black"></div>
    </div>
  );
}

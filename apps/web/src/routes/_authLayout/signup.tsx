import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authLayout/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authLayout/signup"!</div>
}

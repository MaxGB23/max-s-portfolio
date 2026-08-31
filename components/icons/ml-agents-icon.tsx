import * as React from "react"

export function MlAgentsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-label="ML-Agents" role="img" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="256" cy="256" r="256" fill="#262626" />
      <path
        d="M256 122 142 298M256 122 370 298M142 298 256 392M370 298 256 392"
        stroke="#FFFFFF"
        strokeWidth="12"
      />
      <circle cx="256" cy="122" r="18" fill="#FFFFFF" />
      <circle cx="142" cy="298" r="18" fill="#FFFFFF" />
      <circle cx="370" cy="298" r="18" fill="#FFFFFF" />
      <circle cx="256" cy="392" r="18" fill="#FFFFFF" />
    </svg>
  )
}
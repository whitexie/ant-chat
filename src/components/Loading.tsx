export default function Loading() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      className="w-5 h-5"
    >
      <g>
        <circle r="20" fill="#0099e5" cy="50" cx="30">
          <animate begin="-0.5s" values="30;70;30" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" attributeName="cx"></animate>
        </circle>
        <circle r="20" fill="#ff4c4c" cy="50" cx="70">
          <animate begin="0s" values="30;70;30" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" attributeName="cx"></animate>
        </circle>
        <circle r="20" fill="#0099e5" cy="50" cx="30">
          <animate begin="-0.5s" values="30;70;30" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" attributeName="cx"></animate>
          <animate repeatCount="indefinite" dur="1s" keyTimes="0;0.499;0.5;1" calcMode="discrete" values="0;0;1;1" attributeName="fill-opacity"></animate>
        </circle>
        <g></g>
      </g>
    </svg>
  )
}

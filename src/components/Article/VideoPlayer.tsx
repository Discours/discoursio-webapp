export default (props: { youtubeId?: string; vimeoId?: string; title?: string }) => {
  // TODO: styling
  return (
    <video
      src={
        props.vimeoId
          ? `https://vimeo.com/${props.vimeoId}`
          : `https://youtube.com/?watch=${props.youtubeId}`
      }
    />
  )
}

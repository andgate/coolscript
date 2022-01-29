import { style } from 'typestyle'

const errorOutputRoot = style({})
const errorMessage = style({})

export type ErrorOutputProps = {
  errors: Array<Error>
}

export function ErrorOutput(props: ErrorOutputProps) {
  return (
    <div className={errorOutputRoot}>
      {props.errors.map((e, i) => (
        <div key={e.message} className={errorMessage}>
          {i + 1}. {e.message}
        </div>
      ))}
    </div>
  )
}

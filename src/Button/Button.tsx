import React from 'react'
import uuid from 'uuid'
import classNames from 'classnames'
import { ButtonProps, buttonClass } from './ButtonHelper'

export class Button extends React.PureComponent<ButtonProps> {
  public static defaultProps: Partial<ButtonProps> = {
    type: 'neutral',
    iconAlignment: 'left'
  }

  get buttonContent (): string | JSX.Element | (string | JSX.Element)[] | null {
    const {
      id,
      children,
      icon,
      iconAlignment
    } = this.props

    if (icon) {
      const iconComponent = (
        <span
          key={id || uuid.v4()}
          className={classNames('button-icon', iconAlignment)}
        >
          {icon}
        </span>
      )

      if (iconAlignment === 'right') {
        return [
          children,
          iconComponent
        ]
      }

      return [
        iconComponent,
        children
      ]
    }

    return children
  }

  public render (): JSX.Element | null {
    const {
      size,
      type,
      className,
      ...props
    } = this.props

    return (
      <button className={buttonClass(type, size, className)} {...props}>
        {this.buttonContent}
      </button>
    )
  }
}

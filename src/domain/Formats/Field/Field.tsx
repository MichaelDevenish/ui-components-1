import React, { Fragment } from 'react'
import { isString, isNumber, isNil } from 'lodash'
import { Text } from '../../Typographies/Text'
import { FieldLabelWrapper } from './style'
import { Props, Variables } from '../../../common'

interface IFieldProps {
  /** Label text */
  label: string

  /** Component to sit to the right of the Label */
  labelRightComponent?: JSX.Element
}

class Field extends React.PureComponent <IFieldProps> {
  public formattedChild (child: string | number | JSX.Element) : JSX.Element {
    if (isString(child) || isNumber(child)) {
      return (
        <Text
          color={Variables.Color.n800}
        >
          {child}
        </Text>
      )
    }

    return child
  }

  get formattedChildren (): JSX.Element[] {
    const {
      children
    } = this.props

    return React.Children.map(
      children,
      this.formattedChild
    )
  }

  get label (): JSX.Element {
    const {
      label,
      labelRightComponent
    } = this.props

    return (
      <FieldLabelWrapper labelRightComponent={labelRightComponent}>
        <Text
          type={Props.TypographyType.Small}
          color={Variables.Color.n700}
          isInline={!isNil(labelRightComponent)}
          className='label-component'
        >
          {label}
        </Text>
        {labelRightComponent}
      </FieldLabelWrapper>
    )
  }

  public render (): JSX.Element {
    return (
      <Fragment>
        {this.label}
        {this.formattedChildren}
      </Fragment>
    )
  }
}

export {
  IFieldProps,
  Field
}

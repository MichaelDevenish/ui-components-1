import React from 'react'

import { Props, Variables } from '../../../common'
import { Text } from '../../Typographies/Text'
import { StatusDot, StatusDotVariants } from '../StatusDot'
import { StyledStatus } from './style'

enum Size {
  Small = 'small',
  Default = 'default'
}

interface IStatusProps {
  /** Component context */
  componentContext?: string
  /** What style variant of status dot to display */
  variant: StatusDotVariants
  /** The margins around the component */
  margins?: Props.Margin
  /** label of the status */
  children: string
  /** If true, will display the status inline */
  isInline?: boolean
  /** Size of the icon */
  size?: Size
}

interface IStatusExtendProps {
  Variant: typeof StatusDotVariants
  Size: typeof Size
}

const Status: React.FC<IStatusProps> & IStatusExtendProps = ({componentContext, margins, size= Size.Default, variant, isInline = false, children}) => {
  return (
    <StyledStatus
      data-component-type={Props.ComponentType.Status}
      data-component-context={componentContext}
      margins={margins}
    >
      <StatusDot variant={variant}/>
      <Text
        color={Variables.Color.n700}
        type={size === Size.Default ? Props.TypographyType.Small : Props.TypographyType.XSmall}
        margins={{ left: Variables.Spacing.sXSmall }}
      >
        {children}
      </Text>
    </StyledStatus>
  )
}

Status.Variant = StatusDotVariants
Status.Size = Size

export {
  Status
}

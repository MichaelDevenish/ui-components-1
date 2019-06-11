import styled from 'styled-components'

import { Variables } from '../../../common'
import { styleForMargins } from '../../Spacers/services/margins'
import { HightLightAreaColors, IHighlightAreaProps } from './HighlightArea'

interface IColorOption {
  border: Variables.Color,
  background: Variables.Color,
}

type ColorOptions = {
  [K in HightLightAreaColors]: IColorOption
}

const ColorOptions: ColorOptions = {
  grey: {
    border: Variables.Color.n400,
    background: Variables.Color.n150
  }
}

const StyledHighlightArea = styled.div<IHighlightAreaProps>`
  border: 1px solid ${ (props: IHighlightAreaProps) => ColorOptions[props.color].border};
  background-color: ${(props: IHighlightAreaProps) => ColorOptions[props.color].background};
  padding: ${Variables.Spacing.sMedium}px;
  border-radius: ${Variables.Style.borderRadius}px;
  ${(props: IHighlightAreaProps) => styleForMargins(props.margins)}
`

export {
  StyledHighlightArea
}

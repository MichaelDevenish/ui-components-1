import React from 'react'
import styled, { StyledComponentClass, css } from 'styled-components'

export interface IMainBox {
  textColor: string
}

export const MainBox = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 2px solid #dfe5e8;
  ${(props: IMainBox) => props.textColor && css`
    color: ${props.textColor};
  `}
`

export const HighLightBox = styled.div`
  display: flex;
  flex-direction: column;
`

export const HighLightCaption = styled.div`
  padding: 5px;
`

export const HighlighImageBlock = styled.div`
  padding: 0 10px 10px 10px;
  height: 100%;
  width: 100%;
`

export const Col = styled.div`
  flex: 1;
  width: 32%;
`
import React, { Fragment } from 'react'

import { Props, Variables } from '../../../common'
import { Brick } from '../../Typographies/Brick'
import { BrickColor } from '../../Typographies/Brick/style'
import { Text } from '../../Typographies/Text'
import { StyledCross, StyledDeleteButton, StyledFilterTag } from './style'

interface IFieldValue {
  label: string
  value: string
}

interface IFilterTagDetail {
  fieldName: string
  label: string
  type: 'equality' | 'range'
  fieldValues: IFieldValue[]
}

interface IFilterTagProps {
  tags: IFilterTagDetail[]
  onTagDeleted: (selectedTag: IFilterTagDetail) => void
  /** The data-component-context */
  componentContext?: string
}

class FilterTag extends React.PureComponent<IFilterTagProps> {
  public render (): JSX.Element | null {
    const {
      tags,
      componentContext
    } = this.props

    if (tags) {
      return (
        <StyledFilterTag
          data-component-type={Props.ComponentType.FilterTag}
          data-component-context={componentContext}
        >
          {tags.map((tag) => this.renderTag(tag))}
        </StyledFilterTag>
      )
    }

    return null
  }

  private renderTag = (tag: IFilterTagDetail) => {
    return (
      <Brick
        key={`tag-${tag.fieldName}`}
        margins={{right: Variables.Spacing.sXSmall,  bottom: Variables.Spacing.s2XSmall}}
        typographyType={Props.TypographyType.Small}
        color={BrickColor.Neutral}
      >
        <Text
          color={Variables.Color.n800}
          type={Props.TypographyType.Small}
        >
          {tag.label}
        </Text>
        {this.tagValue(tag)}
        <StyledDeleteButton
          onClick={this.deleteTag(tag)}
        >
          <StyledCross>×</StyledCross>
        </StyledDeleteButton>
      </Brick>
    )
  }

  private tagValue = (tag: IFilterTagDetail) => {
    if (tag.type === 'range') {
      if (tag.fieldValues.length === 2) {
        return (
          <>
            <Text
              color={Variables.Color.n800}
              type={Props.TypographyType.Small}
            >
              {' from '}
            </Text>
            <Text
              color={Variables.Color.n800}
              type={Props.TypographyType.Small}
              weight={Variables.FontWeight.fwSemiBold}
            >
              {tag.fieldValues[0].label}
            </Text>
            <Text
              color={Variables.Color.n800}
              type={Props.TypographyType.Small}
            >
              {' to '}
            </Text>
            <Text
              color={Variables.Color.n800}
              type={Props.TypographyType.Small}
              weight={Variables.FontWeight.fwSemiBold}
            >
              {tag.fieldValues[1].label}
            </Text>
          </>
        )
      } else {
        throw Error('Tag should have two field values when its type is range')
      }
    }

    if (tag.type === 'equality') {
      return (
        <>
          <Text
            color={Variables.Color.n800}
            type={Props.TypographyType.Small}
          >
            {' is '}
          </Text>
          {
            tag.fieldValues.map((fieldValue, index) => {
              return (
                <Fragment key={fieldValue.value}>
                  {index !== 0 && this.seperator}
                  <Text
                    color={Variables.Color.n800}
                    type={Props.TypographyType.Small}
                    weight={Variables.FontWeight.fwSemiBold}
                  >
                    {fieldValue.label}
                  </Text>
                </Fragment>
              )
            })
          }
        </>
      )
    }
  }

  private get seperator () {
    return (
      <Text
        color={Variables.Color.n800}
        type={Props.TypographyType.Small}
      >
        {' or '}
      </Text>
    )
  }

  private deleteTag = (deletedTag: IFilterTagDetail) => () => {
    const {
      onTagDeleted
    } = this.props

    onTagDeleted(deletedTag)
  }
}

export {
  IFilterTagDetail,
  FilterTag,
  IFieldValue
}

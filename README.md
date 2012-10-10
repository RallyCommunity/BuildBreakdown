Build Breakdown
=========================

## Overview

Build Breakdown is a Rally App for displaying information about build status.

## Features

Build Breakdown shows builds belonging to a specific build definition. Builds are colored coded by success/failure and their magnitude is toggleable to represent either the number of changesets in each build or the duration of the build. Builds are ordered by date can be optionally shown accross a time line axis to show when builds were run. Hovering over each build displays information about the build. Clicking on a build causes integrated apps (Build Action Board https://github.com/skandl/BuildActionBoard) and (CI Build Report https://github.com/EddieGotherman/build-dashboard) to display information related to the selected build.

## Benefits

Using the Build Breakdown app in conjunction with the Build Action Board and the CI Build Report creates a dashboard to quickly identify build status and pinpoint failure points.

## Configuration

This app requires Rally's Changeset integration adapter for SVN, Git, or other SCM.

Checkout our demo:
http://www.screencast.com/t/M8tqxpqEr

## Wishlist
- Add pan/zoom in HighCharts
- Break up build bars by # of changesets and # of changes per changeset (Like this http://www.highcharts.com/demo/column-stacked).
- Remove/exclude erroneous points
- Sort / show distribution of variance in # of changesets or build time.
- Add a stack of TestCases per build with individual Pass\Fail Green\Red blocks to allow you to see which tests fail often (see red across builds)
- Changing project scope or resizing panels in the 3-panel view breaks the message bus and requires a refresh of entire page.  Bug?

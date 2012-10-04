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
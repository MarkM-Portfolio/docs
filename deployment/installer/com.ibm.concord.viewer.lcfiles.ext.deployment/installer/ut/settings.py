# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

# -*- encoding: utf8 -*-
"""
This file saves all confiurable commands

if you need to add new commands, check examples below, and pay attension to SORT
"""

#A1,A2,A3,A4
ut_commands_00 = [
  {
    'class': 'ut.Checkpoint',
    'isEnabled': False,
    'expected': 'A1A2A3A4',
    'actual': ''
  },

  {
    'class': 'ut.fake_command.FakeCommand',
    'isEnabled': True,
    'cfg': {},
  },
]

#A1,A2,A3,A4,B1,B2,A1,A5
ut_commands_01 = [
  {
    'class': 'ut.Checkpoint',
    'isEnabled': False,
    'expected': 'A1A2A3A4B1B2A1A5',
    'actual': ''
  },

  {
    'class': 'ut.fake_command.FakeCommand',
    'isEnabled': True,
    'cfg': {}
  },

  {
    'class': 'ut.fake_command_precheck_failed.FakeCommandPreCheckFailed',
    'isEnabled': True,
    'cfg': {}
  },
]

#A1,A2,A3,A4,C1,C2,C3,A1,A5
ut_commands_02 = [
  {
    'class': 'ut.Checkpoint',
    'isEnabled': False,
    'expected': 'A1A2A3A4C1C2C3A1A5',
    'actual': ''
  },

  {
    'class': 'ut.fake_command.FakeCommand',
    'isEnabled': True,
    'cfg': {}
  },

  {
    'class': 'ut.fake_command_do_failed.FakeCommandDoFailed',
    'isEnabled': True,
    'cfg': {}
  },
]

#A1,A2,A3,A4,D1,D2,D3,D4,D1,D5,A1,A5
ut_commands_03 = [
  {
    'class': 'ut.Checkpoint',
    'isEnabled': False,
    'expected': 'A1A2A3A4D1D2D3D4D1D5A1A5',
    'actual': ''
  },

  {
    'class': 'ut.fake_command.FakeCommand',
    'isEnabled': True,
    'cfg': {}
  },

  {
    'class': 'ut.fake_command_postcheck_failed.FakeCommandPostCheckFailed',
    'isEnabled': True,
    'cfg': {}
  },
]

#A1,A2,A3,A4,E1,E2,E3,E4
ut_commands_04 = [
  {
    'class': 'ut.Checkpoint',
    'isEnabled': False,
    'expected': 'A1A2A3A4E1E2E3E4',
    'actual': ''
  },

  {
    'class': 'ut.fake_command.FakeCommand',
    'isEnabled': True,
    'cfg': {}
  },

  {
    'class': 'ut.fake_command_with_undo_failed.FakeCommandUndoFailed',
    'isEnabled': True,
    'cfg': {}
  },
]

#A1,A2,A3,A4,F1,A1,A5
ut_commands_05 = [
  {
    'class': 'ut.Checkpoint',
    'isEnabled': False,
    'expected': 'A1A2A3A4F1A1A5',
    'actual': ''
  },

  {
    'class': 'ut.fake_command.FakeCommand',
    'isEnabled': True,
    'cfg': {}
  },

  {
    'class': 'ut.fake_command_with_readcfg_exp.FakeCommandWithReadCfgExp',
    'isEnabled': True,
    'cfg': {}
  },
]

#A1,A2,A3,A4,G1,G2,A1,A5
ut_commands_06 = [
  {
    'class': 'ut.Checkpoint',
    'isEnabled': False,
    'expected': 'A1A2A3A4G1G2A1A5',
    'actual': ''
  },

  {
    'class': 'ut.fake_command.FakeCommand',
    'isEnabled': True,
    'cfg': {}
  },

  {
    'class': 'ut.fake_command_with_precheck_exp.FakeCommandWithPreCheckExp',
    'isEnabled': True,
    'cfg': {}
  },
]

#A1,A2,A3,A4,H1,H2,H3,A1,A5
ut_commands_07 = [
  {
    'class': 'ut.Checkpoint',
    'isEnabled': False,
    'expected': 'A1A2A3A4H1H2H3A1A5',
    'actual': ''
  },

  {
    'class': 'ut.fake_command.FakeCommand',
    'isEnabled': True,
    'cfg': {}
  },

  {
    'class': 'ut.fake_command_with_do_exp.FakeCommandWithDoExp',
    'isEnabled': True,
    'cfg': {}
  },
]

#A1,A2,A3,A4,I1,I2,I3,I4,I1,I5,A1,A5
ut_commands_08 = [
  {
    'class': 'ut.Checkpoint',
    'isEnabled': False,
    'expected': 'A1A2A3A4I1I2I3I4I1I5A1A5',
    'actual': ''
  },

  {
    'class': 'ut.fake_command.FakeCommand',
    'isEnabled': True,
    'cfg': {}
  },

  {
    'class': 'ut.fake_command_with_postcheck_exp.FakeCommandWithPostCheckExp',
    'isEnabled': True,
    'cfg': {}
  },
]

#A1,A2,A3,A4,J1,J2,J3,J4
ut_commands_09 = [
  {
    'class': 'ut.Checkpoint',
    'isEnabled': False,
    'expected': 'A1A2A3A4J1J2J3J4',
    'actual': ''
  },

  {
    'class': 'ut.fake_command.FakeCommand',
    'isEnabled': True,
    'cfg': {}
  },

  {
    'class': 'ut.fake_command_with_undo_exp.FakeCommandWithUndoExp',
    'isEnabled': True,
    'cfg': {}
  },
]

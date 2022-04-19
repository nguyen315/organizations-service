import { MESSAGE } from 'src/shared/message';
import { StatusCodes } from 'http-status-codes';
import debug from 'src/utils/debug';
import db from 'src/models';
import * as orgService from './organization.service';

const NAMESPACE = 'ORG-CTRL';

export const getMembersByOrgId = async (req, res) => {
  const { orgId } = req.params;

  const users = await orgService.getMembersByOrgId(orgId).catch((err) => {
    debug.log(NAMESPACE, 'Error while getting users of org ' + orgId, err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  res.json({ users });
};

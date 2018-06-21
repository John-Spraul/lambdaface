const knex = require('../../database/db.js');
const uuidv4 = require('uuid/v4');

const getComments = (req, res) => {
  const { parentId } = req.params;
  
  const child = req.path.indexOf('child') !== -1;

  const fetch = child
    ? 'child_comment'
    : 'comment';

  knex(fetch)
    .where({ parentId })
    .orderBy('createdAt', 'desc')
    .then(async (response) => {
      // todo votes
      for (let comment of response) {

        const [ user ] = await knex('user')
          .where({ id: comment.userId });

        const [ commentCount ] = (() => {
          if (!child) {
            return await knex('comment')
              .where({ parentId: comment.id })
          }
        })();

        comment.user = user;
        if (commentCount) {
          comment.commentCount = commentCount;
        }
      }
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(422).json({ error: err });
    });
};

const createComment = (req, res) => {
  const id = uuidv4();
  const {
    content, userId, parentId, parentType,
  } = req.body;

  knex.insert({
    id, content, userId, parentId, parentType,
  }).into('comment')
    .then(async (response) => {
      await knex('post')
        .where({ id: parentId })
        .increment('commentCount', 1);

      res.status(201).json({ success: response });
    })
    .catch((err) => {
      res.status(422).json({ error: err });
    });
};

const editComment = (req, res) => {
  const { id } = req.params;
  const comment = req.body;

  knex('comment').where({ id }).update(comment)
    .then((response) => {
      res.status(200).json({ success: response });
    })
    .catch((err) => {
      res.status(422).json({ error: err });
    });
};

const deleteComment = (req, res) => {
  const { id } = req.params;
  const content = 'Message Deleted';

  knex('comment').where({ id }).update({ content })
    .then((response) => {
      res.status(200).json({ success: response });
    })
    .catch((err) => {
      res.status(422).json({ error: err });
    });
};

module.exports = {
  getComments,
  createComment,
  editComment,
  deleteComment,
};
